<template>
  <el-card class="uploader-card">
    <el-row class="card__header">
      <el-col>
        <h1 class="center">Загрузка водяного знака</h1>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="24"></el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <span> Лого </span>
        <el-switch
          v-model="type"
          active-color="#42ab27"
          inactive-color="#808080"
        >
        </el-switch>
        <span> Заливка на все изображение</span>
      </el-col>
    </el-row>
    <el-row>
      <el-col>
        <el-divider class="no-margin" />
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-card>
          <el-input
            v-model="name"
            :rows="1"
            type="textarea"
            placeholder="Название"
          />
        </el-card>
      </el-col>
    </el-row>
    <el-row>
      <el-col>
        <el-divider class="no-margin" />
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-upload
          class="upload-demo"
          drag
          :auto-upload="false"
          :limit="1"
          v-model:file-list="fileList"
          list-type="picture"
        >
          <el-icon class="el-icon--upload">
            <upload-filled />
          </el-icon>
          <div class="el-upload__text">
            <span class="el-upload__text2"
              >Кликните или <em>перенесите сюда изображение</em></span
            >
          </div>
        </el-upload>
      </el-col>
    </el-row>
    <el-row
      justify="center"
      class="card__footer"
      style="text-align: -webkit-center"
    >
      <el-col :sm="2" :xs="24">
        <el-button type="success" :disabled="!name" @click="sendImage"
          >Сохранить
        </el-button>
      </el-col>
      <el-col :sm="2" :xs="24">
        <el-button type="danger" @click="$emit('close')">Отмена</el-button>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useWatermarkStore, type Watermark } from "@/stores/watermark";
import { ElMessage } from "element-plus";
import { errVueHandler } from "@/plugins/errorResponser";

const WatermarkStore = useWatermarkStore();

const initLoader = ref(true);
const showLoader = () => (initLoader.value = true);
const hideLoader = () => (initLoader.value = false);
const emit = defineEmits(["close"]);

//toDo
const imageData = ref<Partial<Watermark>>({});

const fileList = ref<any[]>([]);

const type = ref(false);
const name = ref<string>("");

const sendImage = async () => {
  const img = fileList.value[0].raw;
  if (img.type.indexOf("image/") !== -1 && img.type.indexOf("svg") === -1) {
    if (img.type.indexOf("gif") !== -1) {
      ElMessage({
        message: "GIF не поддерживается!",
        type: "warning",
        center: true,
        duration: 0,
        showClose: true,
      });
      return false;
    }
  } else if (img.type === "image/svg+xml") {
    ElMessage({
      message: "SVG не поддерживается",
      type: "warning",
      center: true,
      duration: 0,
      showClose: true,
    });
    return false;
  } else {
    ElMessage({
      message: `${img.type} не поддерживается`,
      type: "warning",
      center: true,
      duration: 0,
      showClose: true,
    });
    return false;
  }

  imageData.value.blob = img;
  imageData.value.type = !type.value ? 0 : 1;
  imageData.value.name = name.value as string;

  showLoader();
  const message = ElMessage({
    message: "Сохраняем изображение...",
    type: "info",
    center: true,
    duration: 0,
  });
  WatermarkStore.sendImage(imageData.value as Watermark).then((res) => {
    if (errVueHandler(res)) {
      emit("close");
      ElMessage({
        message: "Успешно сохранено",
        type: "success",
        center: true,
        duration: 2000,
      });
    }
    message.close();
    hideLoader();
  });
};
</script>

<style scoped>
.uploader-card {
  max-height: 86vh;
  overflow: auto;
}

.center {
  text-align: center;
}

.el-upload__text {
  text-align: center;
}
.el-upload__text2 {
  position: sticky;
}
</style>
