import type { IconImageLayerStyleAttributeValue } from '@antv/li-p2';
import { iconImageLayerStyleConfigToFlat, iconImageLayerStyleFlatToConfig } from '@antv/li-p2';
import type { LayerRegisterForm, LayerRegisterFormProps, LayerRegisterFormResultType } from '@antv/li-sdk';
import getSchema from './schema';
/**
 * 表单数据格式转换，将结构化数据转换为表单的平铺结构
 */
const toValues = (config: LayerRegisterFormResultType<IconImageLayerStyleAttributeValue>) => {
  const { sourceConfig, visConfig } = config;
  const { parser } = sourceConfig;
  const coordinateType = sourceConfig.parser?.geometry ? 'geometry' : 'table';
  const pointCoordinate = parser?.geometry
    ? { geometry: parser.geometry }
    : { longitude: parser?.x, latitude: parser?.y };
  return {
    coordinateType,
    ...pointCoordinate,
    ...iconImageLayerStyleConfigToFlat(visConfig),
  };
};
/**
 * 表单数据格式转换，将表单的平铺数据结构转为结构化数据
 */
const fromValues = (values: Record<string, any>): LayerRegisterFormResultType<IconImageLayerStyleAttributeValue> => {
  const pointCoordinate = values.geometry ? { geometry: values.geometry } : { x: values.longitude, y: values.latitude };
  const sourceConfig = {
    parser: {
      type: 'json',
      ...pointCoordinate,
    },
  };
  const visConfig = iconImageLayerStyleFlatToConfig(values);
  return {
    sourceConfig,
    visConfig: {
      ...visConfig,
      state: {
        active: false,
        select: false,

        // active: {
        //   color: '#FFF684',
        // },
        // select: {
        //   color: '#FFF684',
        //   radius: undefined,
        // },
      },
    },
  };
};

export default (props: LayerRegisterFormProps): LayerRegisterForm<IconImageLayerStyleAttributeValue> => {
  // 属性面板表单的 Schema 定义，来自表单库 formily 的 Schema
  const schema = getSchema(props.datasetFields);
  return {
    schema,
    toValues,
    fromValues,
  };
};
