<template>
    <div style="text-align: right;">
        <el-input
            v-model="importStr"
            type="textarea"
            :autosize="{ minRows: 10, maxRows: 20}"
            placeholder="请输入内容"
        >
        </el-input>
        <p style="margin-top: 20px;">
            <el-button type="primary" @click="$emit('onImport', importStr)">导入</el-button>
        </p>
    </div>
</template>

<script>

    export default {
        name: 'ImportSchemaView',
        data() {
            return {
                importStr: ''
            };
        }
    };
</script>
