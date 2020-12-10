<template>
    <div style="text-align: right;">
        <el-input
            v-model="importStr"
            type="textarea"
            :autosize="{ minRows: 10, maxRows: 20}"
            placeholder="注意：导入数据格式请参考导出数据格式，如果导出的数据手动修改过再次导入可能会导入失败或者匹配组件异常"
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
