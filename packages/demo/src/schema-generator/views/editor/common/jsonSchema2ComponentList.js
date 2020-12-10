/**
 * Created by Liu.Jun on 2020/12/9 16:59.
 */

import { formUtils } from '@lljj/vue-json-schema-form';
import { generateEditorItem } from './editorData';
import { isObject } from './utils';

function flatToolItems(toolItems) {
    return toolItems.reduce((preVal, curVal) => [
        ...preVal,
        ...curVal.componentList
    ], []);
}


// const getDefaultFormDataBySchema = (() => {
//     // cache
//     const cacheValueMap = new Map();
//
//     return (schema) => {
//
//     };
// })();

function schemaIncludes(target = {}, baseSchema = {}) {
    const keys = Object.keys(baseSchema);
    return keys.every((k) => {
        // 跳过title 属性
        if (k === 'title') return true;

        // Array 类型暂不需要对比
        if (Array.isArray(target[k])) return true;

        // 对象递归
        if (isObject(target[k]) && isObject(baseSchema[k])) {
            return schemaIncludes(target[k], baseSchema[k]);
        }

        return target[k] === baseSchema[k];
    });
}

function viewSchemaMatch(target, toolItem) {
    const baseViewSchema = toolItem.componentPack.viewSchema;

    // 计算 target 包含 toolItem
    // type:string enum 单选类型是个例外。
    // 这样区分有点乱，考虑基础组件拆开单选类型
    return schemaIncludes(target, baseViewSchema)
        && (target.enum ? baseViewSchema.title === '单选类型' : true);
}

const errorNode = [];

function getUserConfigByViewSchema(curSchema, toolConfigList) {
    const toolItem = toolConfigList.find(item => viewSchemaMatch(curSchema, item));

    if (toolItem) {
        return generateEditorItem({
            ...toolItem,

            // todo:计算默认值
            componentValue: {}
        });
    }

    // 错误只记录 title 和type
    errorNode.push({
        title: curSchema.title,
        type: curSchema.type,
    });

    // 异常数据
    return null;
}

export default function jsonSchema2ComponentList(code, toolItems) {
    // 清空错误信息
    errorNode.length = 0;

    if (String(code).trim() === '') return null;

    const toolConfigList = flatToolItems(toolItems);
    const data = JSON.parse(code);
    const {
        schema, formFooter, formProps, /* uiSchema, */
    } = data;

    // 广度队列
    let eachQueue = [schema];

    // 记录输出的list
    const componentList = [];

    const getChildList = (curSchema) => {
        const res = (curSchema.$$parentNode && curSchema.$$parentNode.childList) || componentList;
        delete curSchema.$$parentNode;
        return res;
    };

    while (eachQueue.length > 0) {
        const curSchema = eachQueue.shift();

        if (curSchema.properties || (curSchema.items && curSchema.items.properties)) {
            // 对象 || 数组内对象
            const curObjNode = curSchema.properties ? curSchema : curSchema.items;

            // 计算当前节点
            const curItem = getUserConfigByViewSchema(curSchema, toolConfigList);

            // 关联父子
            (getChildList(curSchema)).push(curItem);

            // 处理子节点
            const properties = Object.keys(curObjNode.properties);
            const orderedProperties = formUtils.orderProperties(properties, curSchema['ui:order']);

            const childSchema = orderedProperties.map(item => ({
                $$parentNode: curItem,
                ...curObjNode.properties[item],
                'ui:required': curObjNode.required && curObjNode.required.includes(item)
            }));

            eachQueue = [...eachQueue, ...childSchema];
        } else {
            // 计算当前节点
            const curItem = getUserConfigByViewSchema(curSchema, toolConfigList);

            // 关联父子
            if (curItem) {
                (getChildList(curSchema)).push(curItem);
            }
        }
    }

    return {
        componentList: componentList[0].childList,
        errorNode,
        formConfig: {
            formFooter,
            formProps
        }
    };
}
