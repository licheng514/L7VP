import type { LineLayerStyleAttributeValue } from '@antv/li-p2';
import { lineLayerStyleConfigToFlat, lineLayerStyleFlatToConfig } from '@antv/li-p2';
import type { LayerRegisterForm, LayerRegisterFormProps, LayerRegisterFormResultType } from '@antv/li-sdk';
import getSchema from './schema';

/**
 * 表单数据格式转换，将结构化数据转换为表单的平铺结构
 */
const toValues = (config: LayerRegisterFormResultType<LineLayerStyleAttributeValue>) => {
  const { sourceConfig, visConfig } = config;
  const { parser } = sourceConfig;
  const coordinateType = sourceConfig.parser?.geometry ? 'geometry' : 'table';
  const coordinate = parser?.geometry
    ? { geometry: parser.geometry }
    : {
        longitude: parser?.x,
        latitude: parser?.y,
        targetLongitude: parser?.x1,
        targetLatitude: parser?.y1,
      };

  return {
    coordinateType,
    ...coordinate,
    ...lineLayerStyleConfigToFlat(visConfig),
  };
};

/**
 * 表单数据格式转换，将表单的平铺数据结构转为结构化数据
 */
const fromValues = (values: Record<string, any>): LayerRegisterFormResultType<LineLayerStyleAttributeValue> => {
  const coordinate = values.geometry
    ? { geometry: values.geometry }
    : { x: values.longitude, y: values.latitude, x1: values.targetLongitude, y1: values.targetLatitude };

  const sourceConfig = {
    parser: {
      type: 'json',
      ...coordinate,
    },
  };

  const visConfig = lineLayerStyleFlatToConfig(values);

  return {
    sourceConfig,
    visConfig: {
      ...visConfig,
      state: {
        active: { color: 'yellow' },
      },
    },
  };
};

export default (props: LayerRegisterFormProps): LayerRegisterForm<LineLayerStyleAttributeValue> => {
  // 属性面板表单的 Schema 定义，来自表单库 formily 的 Schema
  const schema = getSchema(props.datasetFields);
  return {
    schema,
    toValues,
    fromValues,
  };
};
