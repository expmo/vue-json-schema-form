/**
 * Created by Liu.Jun on 2020/12/9 16:59.
 */

import { formUtils } from '@lljj/vue-json-schema-form';
import { generateEditorItem } from './editorData';

function flatToolItems(toolItems) {
    return toolItems.reduce((preVal, curVal) => [
        ...preVal,
        ...curVal.componentList
    ], []);
}


function viewSchemaIncludes(target, item) {
    if (target.type === item.type) {

    }

    return false;
}

function getUserConfigByViewSchema(viewSchema, toolConfigList) {
    const toolItem = toolConfigList.find(item => viewSchemaIncludes(viewSchema, item));
    debugger;
}

export default function jsonSchema2ComponentList(code, toolItems) {
    const toolConfigList = flatToolItems(toolItems);
    try {
        const data = JSON.parse(code);
        const {
            schema, formFooter, formProps, /* uiSchema, */
        } = data;

        // 广度队列
        let eachQueue = [schema];

        // 记录输出的list
        const componentList = [];

        const getChildList = curSchema => (curSchema.$$parentNode && curSchema.$$parentNode.childList) || componentList;

        while (eachQueue.length > 0) {
            const curSchema = eachQueue.shift();

            if (curSchema.properties || (curSchema.items && curSchema.items.properties)) {
                // 对象 || 数组内对象
                const curObjNode = curSchema.properties ? curSchema : curSchema.items;

                // 计算当前节点
                // const curItem = {
                //     type: 'object-array',
                //     childList: []
                // };

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
                // const curItem = {
                //     type: 'item'
                // };
                const curItem = getUserConfigByViewSchema(curSchema, toolConfigList);

                // 关联父子
                (getChildList(curSchema)).push(curItem);
            }
        }

        return {
            componentList,
            formConfig: {
                ...formFooter,
                ...formProps
            }
        };
    } catch (e) {
        throw e;
    }
}
