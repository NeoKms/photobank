<script setup lang="ts">
import { ElMessage } from "element-plus";
import { ref, computed, onMounted, watch } from "vue";
import { Cropper } from "vue-advanced-cropper";
import type {
  Coordinates,
  CropperResult,
  Point,
  Transform,
} from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";
import {
  usePhotobankStore,
  type SimpleObject,
  type ImageToUpload,
} from "@/stores/photobank";
import { errVueHandler } from "@/plugins/errorResponser";
import PhotoParamsEditor from "./PhotoParamsEditor.vue";
import PhotoPreviewCollapse from "./PhotoPreviewCollapse.vue";
import {useI18n} from "vue-i18n";
const props = defineProps({
  externalDropImages: {
    type: FileList,
    default: () => [],
  },
});
const i18n = useI18n();
interface CroppComponentInterface {
  getResult: () => CropperResult;
  setCoordinates: (transform: Transform | Transform[]) => void;
  refresh: () => void;
  zoom: (factor: number, center?: Point) => void;
  move: (left: number, top?: number) => void;
  rotate: (angle: number) => void;
  flip: (horizontal: boolean, vertical?: boolean) => void;
  reset: () => void;
  coordinates: Coordinates;
}
const PhotobankStore = usePhotobankStore();
const initLoader = ref(true);
const showLoader = () => (initLoader.value = true);
const hideLoader = () => (initLoader.value = false);
const emit = defineEmits(["close", "success"]);
//
const stencilAcceptRatiosByTitle = computed(() =>
  PhotobankStore.getStencilAcceptRatios.reduce((a, r) => {
    a[r.title] = r.ratio;
    return a;
  }, {} as SimpleObject)
);
const defaultStencilRatio = computed(
  () => PhotobankStore.getDefaultStencilRatio
);
const stencilAcceptRatios = computed(
  () => PhotobankStore.getStencilAcceptRatios
);
// cropp
const britness = ref(0);
const saturation = ref(0);
const contrast = ref(0);
const editor = ref<any | HTMLCanvasElement>(null);
const croppComponent = ref<any | CroppComponentInterface>(null);
console.log("defaultStencilRatio", defaultStencilRatio.value);
const cropperProps = ref({
  aspectRatio:
    defaultStencilRatio.value > 0 ? defaultStencilRatio.value : 16 / 9,
  resizable: true,
});
const currentProportion = computed(() => {
  if (defaultStencilRatio.value > 0) {
    return defaultStencilRatio.value;
  } else if (
    croppComponent.value &&
    croppComponent.value?.imageSize?.width &&
    croppComponent.value?.imageSize?.height
  ) {
    return (
      croppComponent.value.imageSize.width /
      croppComponent.value.imageSize.height
    );
  } else {
    return stencilAcceptRatiosByTitle.value["16/9"] || 1.7777777;
  }
});
const crop_defaultSize = ({
  imageSize,
  visibleArea,
}: {
  imageSize: { width: number; height: number };
  visibleArea: { width: number; height: number };
}) => {
  return {
    width: (visibleArea || imageSize).width,
    height: (visibleArea || imageSize).height,
  };
};
const crop_flip = (x: boolean, y: boolean) => {
  croppComponent.value.flip(x, y);
};
const crop_rotate = (angle: number) => {
  croppComponent.value.rotate(angle);
  sliderRotete.value = croppComponent.value.imageTransforms.rotate;
};
const crop_rotate_const = (angle: number) => {
  crop_rotate(angle - croppComponent.value.imageTransforms.rotate);
};
const crop_maximize = () =>
  croppComponent.value &&
  croppComponent.value.setCoordinates([
    ({ imageSize }: { imageSize: { width: number; height: number } }) => ({
      width: imageSize.width,
      height: imageSize.height,
    }),
    ({
      coordinates,
      imageSize,
    }: {
      coordinates: { width: number; height: number };
      imageSize: { width: number; height: number };
    }) => ({
      left: imageSize.width / 2 - coordinates.width / 2,
      top: imageSize.height / 2 - coordinates.height / 2,
    }),
  ]);
const reloadCropper = () => {
  crop_maximize();
  croppComponent?.value?.refresh();
};
const setProportion = () => {
  try {
    if (currentProportion.value) {
      const comarr = stencilAcceptRatios.value.map((r) =>
        Math.abs(currentProportion.value - r.ratio)
      );
      const min = Math.min(...comarr);
      const minInd = comarr.findIndex((el) => el === min);
      console.log("cropperProps.value.aspectRatio", cropperProps.value);
      if (cropperProps?.value?.aspectRatio) {
        // cropperProps.value.aspectRatio = stencilAcceptRatios.value[minInd].ratio;
      }
      setTimeout(() => reloadCropper(), 100);
    }
  } catch (err) {
    console.log("AAAAAAAA", err);
  }
};
watch(currentProportion, setProportion);
// main
const imagesData = ref<ImageToUpload[]>([]);
const sendImages = () => {
  if (imagesData.value.find((image) => !image.newSource && !image.source_id)) {
    return ElMessage({
      message: i18n.t("notif.not_all_sources"),
      type: "error",
      center: true,
      duration: 2000,
    });
  }
  showLoader();
  const message = ElMessage({
    message: i18n.t("notif.save_photo"),
    type: "info",
    center: true,
    duration: 0,
  });
  PhotobankStore.sendImages(imagesData.value).then((res) => {
    if (errVueHandler(res, null, i18n)) {
      emit("success");
      ElMessage({
        message: i18n.t("notif.success_save"),
        type: "success",
        center: true,
        duration: 2000,
      });
    }
    message.close();
    hideLoader();
  });
};
onMounted(() => {
  PhotobankStore.fetchTags({
    select: ["id", "name"],
    filter: {
      is_active: 1,
    },
    options: {
      onlyLimit: true,
      itemsPerPage: 5,
    },
  }).then((res) => {
    if (errVueHandler(res, i18n.t("errors.init"), i18n)) {
      hideLoader();
      if (props.externalDropImages.length) {
        changeFileInput(props.externalDropImages);
      }
    }
  });
});
// setp 3

// step 2
const imagesListElementsRef = ref<SimpleObject>({});
const defaultFields = ref<Partial<ImageToUpload>>({
  type: 1,
  tags: new Set(),
  del_checked: false,
  del_after: 86400,
  source_id: null,
  author_id: null,
  newAuthor: "",
  newSource: "",
  description: "",
});
const currentImageIndex = ref(0);
const sliderRotete = ref(0);
const currentImageData = computed(() => {
  return imagesData.value[currentImageIndex.value];
});
const scrollToCurrentImageCard = () => {
  imagesListElementsRef.value[
    currentImageData.value.key || ""
  ].$el.scrollIntoView({ behavior: "smooth" });
};
const changeCurrentImage = (index: number) => {
  if (imagesData.value[index].is_gif) return;
  britness.value = 0;
  saturation.value = 0;
  contrast.value = 0;
  currentImageIndex.value = index;
  crop_maximize();
  scrollToCurrentImageCard();
};
const delImage = (index: number) => {
  imagesData.value.splice(index, 1);
  if (imagesData.value.length === 0) {
    activeStep.value = 0;
  }
};
const blobWithPromise = async (canvas: HTMLCanvasElement): Promise<Blob> => {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(false)),
      currentImageData.value.mime
    )
  );
};
const acceptCropp = async () => {
  const { canvas } = croppComponent.value.getResult();
  const blob = await blobWithPromise(canvas);
  imagesData.value[currentImageIndex.value].blob = blob;
  imagesData.value[currentImageIndex.value].preview = URL.createObjectURL(blob);
  imagesData.value[currentImageIndex.value].cropped = true;
  const nextInd = imagesData.value.findIndex((img) => !img.cropped);
  if (nextInd >= 0) {
    currentImageIndex.value = nextInd;
  }
  scrollToCurrentImageCard();
  crop_maximize();
};
const revertCropp = () => {
  imagesData.value[currentImageIndex.value].preview =
    currentImageData.value.initial_url;
  imagesData.value[currentImageIndex.value].cropped = false;
  sliderRotete.value = 0;
  crop_maximize();
};
// step 1
const dropField = ref<any | HTMLElement>(null);
const imagesInputRef = ref<any | HTMLInputElement>(null);
const stopAll = (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
};
const changeFileInput = (files: null | FileList = null) => {
  const message = ElMessage({
    message: i18n.t("notif.upload"),
    type: "info",
    center: true,
    duration: 0,
  });
  showLoader();
  setTimeout(() => {
    imagesData.value = Array.from<{ name: string; data: Blob } & Blob>(
      files || imagesInputRef.value.files || []
    )
      .filter((img) => {
        if (
          img.type.indexOf("image/") !== -1 &&
          img.type.indexOf("svg") === -1
        ) {
          if (img.type.indexOf("gif") !== -1) {
            ElMessage({
              message: i18n.t("notif.gif_to_static"),
              type: "warning",
              center: true,
              duration: 0,
              showClose: true,
            });
          }
          return true;
        } else if (img.type === "image/svg+xml") {
          ElMessage({
            message: i18n.t("notif.not_supported_type",{type:"SVG"}),
            type: "warning",
            center: true,
            duration: 0,
            showClose: true,
          });
        } else {
          ElMessage({
            message: i18n.t("notif.not_supported_type",{type: img.type}),
            type: "warning",
            center: true,
            duration: 0,
            showClose: true,
          });
        }
      })
      .map<ImageToUpload>((img, ind) => ({
        blob: img,
        key: `tmp_${ind}`,
        name: img.name,
        size: img.size,
        mime: img.type,
        cropped: img.type.indexOf("gif") === -1 ? false : true,
        is_gif: img.type.indexOf("gif") !== -1,
        preview: URL.createObjectURL(img),
        initial_url: URL.createObjectURL(img),
      }));
    imagesData.value.slice(0, 50);
    if (imagesData.value.length) {
      currentImageIndex.value = imagesData.value.findIndex(
        (img) => !img.is_gif
      );
      next();
      setTimeout(() => crop_maximize(), 500);
      if (currentImageIndex.value < 0) {
        next();
      }
    }
    hideLoader();
    message.close();
  }, 500);
};
const drop = (e: DragEvent) => {
  stopAll(e);
  dropField.value.style.backgroundColor = "";
  changeFileInput(e.dataTransfer?.files);
};
//stepper
const activeStep = ref(0);
const next = () => {
  showLoader();
  setTimeout(() => {
    const skip = activeStep.value === 1 && imagesData.value.length === 1;
    if (activeStep.value === 2 || skip) {
      const copyDefault = JSON.parse(JSON.stringify(defaultFields.value));
      copyDefault.tags = new Set(
        JSON.parse(JSON.stringify(Array.from(defaultFields.value.tags || [])))
      );
      imagesData.value.forEach((image) => {
        const copyDefault = JSON.parse(JSON.stringify(defaultFields.value));
        copyDefault.tags = new Set(Array.from(defaultFields.value.tags || []));
        Object.assign(image, copyDefault);
      });
      skip && activeStep.value++;
    }
    activeStep.value++;
    hideLoader();
  }, 200);
};
const prev = () => {
  showLoader();
  setTimeout(() => {
    const skip = activeStep.value === 3 && imagesData.value.length === 1;
    if (
      activeStep.value === 2 &&
      imagesData.value.filter((img) => !img.is_gif).length === 0
    ) {
      activeStep.value -= 2;
    } else {
      activeStep.value--;
    }
    skip && activeStep.value--;
    hideLoader();
  }, 200);
};
// britness saturation and contrast
const imageCache = ref<SimpleObject>({});
const loadImage = async (dataUrl: string) => {
  if (imageCache.value[dataUrl]) return imageCache.value[dataUrl];
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = dataUrl;
    img.onload = () => resolve(img);
    img.onerror = reject;
    imageCache.value[dataUrl] = img;
  });
};
const changeBritnessInCanvas = (buf: Uint32Array, src: Uint32Array) => {
  const delta = britness.value;
  for (let i = 0; i < buf.length; i++) {
    let r = src[i] & 0xff;
    let g = (src[i] >> 8) & 0xff;
    let b = (src[i] >> 16) & 0xff;
    r += delta;
    g += delta;
    b += delta;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;
    buf[i] = (src[i] & 0xff000000) | (b << 16) | (g << 8) | r;
  }
};
const changeSaturationsInCanvas = (buf: Uint32Array, src: Uint32Array) => {
  const value = saturation.value;
  for (let i = 0; i < buf.length; i++) {
    let r = src[i] & 0xff;
    let g = (src[i] >> 8) & 0xff;
    let b = (src[i] >> 16) & 0xff;
    const gray = r * 0.2126 + g * 0.7152 + b * 0.0722;
    r += ((r - gray) * value) / 255;
    g += ((g - gray) * value) / 255;
    b += ((b - gray) * value) / 255;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;
    buf[i] = (src[i] & 0xff000000) | (b << 16) | (g << 8) | r;
  }
};
const changeContrastInCanvas = (buf: Uint32Array, src: Uint32Array) => {
  let gray = 0;
  const delta = contrast.value;
  for (let i = 0; i < buf.length; i++) {
    const r = src[i] & 0xff;
    const g = (src[i] >> 8) & 0xff;
    const b = (src[i] >> 16) & 0xff;
    gray += r * 0.2126 + g * 0.7152 + b * 0.0722;
  }
  gray /= buf.length;
  for (let i = 0; i < buf.length; i++) {
    let r = src[i] & 0xff;
    let g = (src[i] >> 8) & 0xff;
    let b = (src[i] >> 16) & 0xff;
    r += ((r - gray) * delta) / 255;
    g += ((g - gray) * delta) / 255;
    b += ((b - gray) * delta) / 255;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;
    buf[i] = (src[i] & 0xff000000) | (b << 16) | (g << 8) | r;
  }
};
const changeCanvasImage = async () => {
  const image = await loadImage(currentImageData.value.preview);
  const canvas = editor.value;
  if (canvas) {
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (context) {
      try {
        context.drawImage(image, 0, 0);
        const imageFromCanvas = context.getImageData(
          0,
          0,
          image.naturalWidth,
          image.naturalHeight
        );
        const src = new Uint32Array(imageFromCanvas.data.buffer);
        const outImg = context.createImageData(
          image.naturalWidth,
          image.naturalHeight
        );
        const dst = new Uint32Array(outImg.data.buffer);
        britness.value !== 100 && changeBritnessInCanvas(dst, src);
        // context.putImageData(outImg, 0, 0);
        saturation.value !== 100 && changeSaturationsInCanvas(dst, dst);
        // context.putImageData(outImg, 0, 0);
        contrast.value !== 100 && changeContrastInCanvas(dst, dst);
        context.putImageData(outImg, 0, 0);
        /////////
        croppComponent.value.imageAttributes.src = canvas.toDataURL();
      } catch (err) {
        console.error(err);
      }
    }
  }
};
watch(britness, () => changeCanvasImage());
watch(saturation, () => changeCanvasImage());
watch(contrast, () => changeCanvasImage());
</script>

<template>
  <input
    type="file"
    name="images[]"
    multiple
    style="display: none"
    ref="imagesInputRef"
    accept="image/*"
    @change="changeFileInput(null)"
  />
  <el-card v-loading="initLoader" class="uploader-card">
    <el-row class="card__header">
      <el-col>
        <el-steps :active="activeStep" finish-status="success" simple>
          <el-step :title="$t('photo_editor.steps.upload')" icon="UploadFilled" />
          <el-step :title="$t('photo_editor.steps.crop')" icon="Crop" />
          <el-step :title="$t('photo_editor.steps.params')" icon="Edit" />
          <el-step :title="$t('photo_editor.steps.check')" icon="Checked" />
        </el-steps>
      </el-col>
    </el-row>
    <el-row>
      <el-col>
        <el-divider class="no-margin" />
      </el-col>
    </el-row>
    <el-row v-if="activeStep === 3">
      <el-col :span="24">
        <photo-preview-collapse v-model="imagesData" />
      </el-col>
    </el-row>
    <el-row v-if="activeStep === 2">
      <el-col :span="24">
        <photo-params-editor v-model="defaultFields" />
      </el-col>
    </el-row>
    <el-row v-else-if="activeStep === 0">
      <el-col :span="24">
        <div
          class="preview drop"
          ref="dropField"
          @click="imagesInputRef.click()"
          @drop="drop($event)"
          @drag="stopAll"
          @dragstart="stopAll"
          @dragend="stopAll"
          @dragover="stopAll"
          @dragenter="dropField.style.backgroundColor = 'grey'"
          @dragleave="dropField.style.backgroundColor = ''"
        >
          <span>{{$t("photo_editor.click_drop_info")}}</span>
        </div>
      </el-col>
    </el-row>
    <el-row v-else-if="activeStep === 1">
      <el-col>
        <el-row :gutter="10">
          <el-col :lg="20" :sm="24">
            <el-row>
              <el-col :span="24">
                <cropper
                  class="cropper"
                  :src="currentImageData.preview"
                  ref="croppComponent"
                  :stencil-props="cropperProps"
                  :default-position="{ left: 0, top: 0 }"
                  :default-size="crop_defaultSize"
                >
                </cropper>
                <canvas ref="editor" class="editor" />
                <div class="left-container">
                  <el-popover placement="right" :width="250" trigger="click">
                    <template #reference>
                      <el-button icon="Operation" round />
                    </template>
                    <el-row class="pb-0" justify="center">
                      <el-button-group>
                        <el-button
                          v-for="ratioObj in stencilAcceptRatios"
                          :key="ratioObj.ratio"
                          v-tooltip.auto="$t('photo_editor.frame_format')"
                          round
                          :class="{
                            active: cropperProps.aspectRatio === ratioObj.ratio,
                          }"
                          @click="
                            cropperProps.aspectRatio = ratioObj.ratio;
                            reloadCropper();
                          "
                          >{{ ratioObj.title }}</el-button
                        >
                      </el-button-group>
                    </el-row>
                    <el-row class="pb-0" justify="center">
                      <el-button-group>
                        <el-button
                          v-tooltip.auto="$t('photo_editor.rotate.right')"
                          style="width: 59.25px"
                          round
                          icon="RefreshRight"
                          @click="crop_rotate(90)"
                        />
                        <el-button
                          v-tooltip.auto="$t('photo_editor.flip.vertical')"
                          style="width: 51.47px"
                          round
                          @click="crop_flip(true, false)"
                        >
                          <el-image src="/flip-horizontal.c757c98c.svg" />
                        </el-button>
                        <el-button
                          v-tooltip.auto="$t('photo_editor.flip.horizontal')"
                          style="width: 51.47px"
                          round
                          @click="crop_flip(false, true)"
                        >
                          <el-image src="/flip-vertical.0f1de4d1.svg" />
                        </el-button>
                        <el-button
                          v-tooltip.auto="$t('photo_editor.rotate.right')"
                          style="width: 51.47px"
                          round
                          icon="RefreshLeft"
                          @click="crop_rotate(-90)"
                        />
                      </el-button-group>
                    </el-row>
                    <el-row class="pb-0" justify="center">
                      {{$t('photo_editor.brightness')}}
                      <el-slider
                        class="slider-in-popover"
                        input-size="small"
                        :show-input-controls="false"
                        show-input
                        size="small"
                        v-model="britness"
                        :min="-255"
                        :max="255"
                      />
                    </el-row>
                    <el-row class="pb-0" justify="center">
                      {{$t('photo_editor.saturation')}}
                      <el-slider
                        class="slider-in-popover"
                        input-size="small"
                        :show-input-controls="false"
                        show-input
                        size="small"
                        v-model="saturation"
                        :min="-255"
                        :max="255"
                      />
                    </el-row>
                    <el-row class="pb-0" justify="center">
                      {{$t('photo_editor.contrast')}}
                      <el-slider
                        class="slider-in-popover"
                        input-size="small"
                        :show-input-controls="false"
                        show-input
                        size="small"
                        v-model="contrast"
                        :min="-255"
                        :max="255"
                      />
                    </el-row>
                    <el-row class="pb-0" justify="center">
                      <el-button-group>
                        <el-button
                          type="success"
                          round
                          icon="Select"
                          @click="acceptCropp"
                          v-tooltip.auto="$t('apply')"
                        />
                        <el-button
                          v-tooltip.auto="$t('cancel_changed')"
                          type="warning"
                          round
                          icon="Refresh"
                          @click="revertCropp"
                        />
                      </el-button-group>
                    </el-row>
                  </el-popover>
                </div>
                <div class="bottom-container">
                  <el-slider
                    v-model="sliderRotete"
                    class="rotate-slider"
                    :min="-180"
                    :max="180"
                    @input="crop_rotate_const"
                  />
                </div>
              </el-col>
            </el-row>
          </el-col>
          <el-col :lg="4" :sm="24">
            <el-card class="image-list">
              <el-row :gutter="50">
                <el-col
                  :lg="24"
                  :sm="6"
                  v-for="(oneImg, ind) in imagesData"
                  :key="oneImg.key"
                  :ref="
                    (el) => {
                      imagesListElementsRef[oneImg?.key || ''] = el;
                    }
                  "
                >
                  <div
                    class="preview-block"
                    :class="{ active: currentImageIndex === ind }"
                  >
                    <el-button
                      :type="oneImg.cropped ? 'success' : ''"
                      size="small"
                      class="index-btn"
                      circle
                      >{{ ind + 1 }}</el-button
                    >
                    <el-button
                      v-tooltip.auto="$t('delete')"
                      size="small"
                      class="delete-btn"
                      icon="Delete"
                      circle
                      @click="delImage(ind)"
                    />
                    <el-image
                      :src="oneImg.preview"
                      lazy
                      fit="contain"
                      class="preview-image"
                      @click="changeCurrentImage(ind)"
                    />
                    <span class="preview-title">{{ oneImg.name }}</span>
                  </div>
                </el-col>
              </el-row>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-row
      justify="space-evenly"
      class="card__footer"
      style="text-align: -webkit-center"
    >
      <el-col
        :sm="2"
        :xs="24"
        v-if="[1, 2, 3].includes(activeStep)"
        class="mb-2"
      >
        <el-button type="success" @click="prev">{{$t("back")}}</el-button>
      </el-col>
      <el-col :sm="2" :xs="24">
        <el-button type="danger" @click="$emit('close')">{{$t("cancel")}}</el-button>
      </el-col>
      <el-col :sm="2" :xs="24" v-if="[1, 2].includes(activeStep)" class="mt-2">
        <el-button type="success" @click="next">{{$t("next")}}</el-button>
      </el-col>
      <el-col :sm="2" :xs="24" v-if="[3].includes(activeStep)" class="mt-2">
        <el-button type="success" @click="sendImages">{{$t("save")}}</el-button>
      </el-col>
    </el-row>
  </el-card>
</template>
<style>
.rotate-slider .el-slider__marks .el-slider__marks-text {
  width: fit-content;
}

.slider-in-popover .el-input-number--small {
  width: 53px !important;
}

.slider-in-popover .el-slider__runway.show-input {
  margin-right: 12px !important;
}
</style>
<style scoped>
.uploader-card {
  max-height: 99vh;
  overflow: auto;
}

.tag-element {
  margin-left: 5px;
  cursor: pointer;
}

.tag-element:hover {
  opacity: 0.8;
}

.delete-btn {
  color: red;
  right: 16px;
  position: absolute;
  z-index: 2;
}

.index-btn {
  position: absolute;
  z-index: 2;
}

.el-row {
  padding: 5px;
}

.cropper {
  height: 470px;
  background: #ddd;
}

.preview {
  align-items: center;
  text-align: center;
  height: 400px;
  max-height: 600px;
}

.drop {
  align-items: center;
  border: 2px dotted grey;
  margin: auto;
  cursor: pointer;
  display: grid;
  text-align: center;
}

.preview-image {
  width: 100%;
  border-radius: 10px;
  height: 100px;
}

.image-list {
  max-height: 480px;
  overflow-y: auto;
}

.preview-block {
  border-radius: 10px;
  margin-bottom: 10px;
}

.preview-block:nth-last-child {
  margin-bottom: 0;
}

.preview-block:hover .preview-image {
  opacity: 0.4;
  cursor: pointer;
}

.preview-block.active .preview-title {
  color: red;
  text-decoration-line: underline;
}

@media screen and (min-height: 900px) {
  .cropper {
    height: 465px;
  }

  .image-list {
    max-height: 475px;
  }
}

.bottom-container {
  position: absolute;
  bottom: -14px;
  width: 99%;
}

.editor {
  display: none;
}

.left-container {
  position: absolute;
  left: 8px;
  top: 8px;
}
</style>
