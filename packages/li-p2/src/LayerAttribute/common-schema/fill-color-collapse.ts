import type { AttributeSchemaOptions } from '../types';

export default (options: AttributeSchemaOptions) => {
  const { fieldList = [], colorRanges = [], collapseTitle = '填充颜色' } = options;
  return {
    type: 'void',
    'x-component': 'FormCollapse',
    'x-component-props': {
      ghost: true,
      destroyInactivePanel: true,
      defaultActiveKey: [],
    },
    properties: {
      fillColor: {
        type: 'void',
        'x-component': 'FormCollapse.CollapsePanel',
        'x-component-props': {
          header: collapseTitle,
        },
        properties: {
          fillColorField: {
            type: 'string',
            title: '填充字段',
            'x-decorator': 'FormItem',
            'x-component': 'FieldSelect',
            'x-decorator-props': {
              tooltip: '选中一个数值字段作为颜色填充字段',
            },
            'x-component-props': {
              allowClear: true,
              placeholder: '请选择字段',
            },
            enum: [...fieldList],
          },

          fillColorScale: {
            type: 'string',
            title: '颜色划分',
            'x-decorator': 'FormItem',
            'x-component': 'ScaleSelector',
            'x-component-props': {
              placeholder: '请选择',
              type:
                '{{ $form.getFieldState("fillColorField",state=> { return state.dataSource.find((item) => item.value === state.value)?.type })}}',
            },
            'x-decorator-props': {},
            'x-reactions': [
              {
                dependencies: ['fillColorField'],
                fulfill: {
                  state: {
                    visible: '{{ $deps[0] !== undefined }}',
                  },
                },
              },
            ],
          },
          // 颜色选择器
          fillColor: {
            type: 'string',
            title: '颜色',
            default: '#F7664E',
            'x-decorator': 'FormItem',
            'x-component': 'ColorPicker',
            'x-component-props': {
              placeholder: '颜色',
            },
            'x-decorator-props': {},
            'x-reactions': [
              {
                dependencies: ['fillColorField'],
                fulfill: {
                  state: {
                    visible: '{{ $deps[0] === undefined }}',
                  },
                },
              },
            ],
          },
          // 色带
          fillColorRange: {
            type: 'object',
            title: '颜色',
            default: {
              colors: ['#ffffcc', '#d9f0a3', '#addd8e', '#78c679', '#31a354', '#006837'],
              isReversed: false,
            },
            'x-decorator': 'FormItem',
            'x-component': 'ColorRangeSelector',
            'x-component-props': {
              options: [...colorRanges],
            },
            'x-decorator-props': {},
            'x-reactions': [
              {
                dependencies: ['fillColorField'],
                fulfill: {
                  state: {
                    visible: '{{ $deps[0] !== undefined }}',
                  },
                },
              },
            ],
          },

          fillColorOpacity: {
            type: 'number',
            title: '透明度',
            default: 1,
            'x-decorator-props': {},
            'x-decorator': 'FormItem',
            'x-component': 'Slider',
            'x-component-props': {
              min: 0,
              max: 1,
              step: 0.1,
            },
          },
        },
      },
    },
  };
};
