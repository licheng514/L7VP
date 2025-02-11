import Icon, { CopyOutlined, EyeInvisibleOutlined, EyeOutlined, FormOutlined, MoreOutlined } from '@ant-design/icons';
import type { LayerSchema } from '@antv/li-sdk';
import { getUniqueId } from '@antv/li-sdk';
import type { MenuProps } from 'antd';
import { Dropdown, message, Popconfirm, Space, Tooltip } from 'antd';
import classnames from 'classnames';
import React, { useState } from 'react';
import LayerName from '../../../../components/EditName';
import { useEditorService, useEditorState } from '../../../../hooks';
import './index.less';

const defaultVis = { icon: () => <span />, color: 'gray' };

type LayerItemProps = {
  layer: LayerSchema;
  dragIcon?: JSX.Element;
  onClickLayer: (layerConfig: LayerSchema) => void;
};

const LayerItem = ({ layer, dragIcon, onClickLayer }: LayerItemProps) => {
  const { updateState } = useEditorState();
  const { appService } = useEditorService();
  const implementLayer = appService.getImplementLayer(layer.type);
  const visLayer = implementLayer?.metadata ?? defaultVis;
  const [isEditName, setIsEditName] = useState(false);
  const [messageApi, messageContextHolder] = message.useMessage();

  const onChangeName = (newName: string) => {
    updateState((draft) => {
      const findIndex = draft.layers.findIndex((item) => item.id === layer.id);
      if (findIndex !== -1) {
        draft.layers[findIndex].metadata!.name = newName;
        setIsEditName(false);
      }
    });
  };

  const onVisibleChange = () => {
    updateState((draft) => {
      const index = draft.layers.findIndex((layerInfo) => layerInfo.id === layer.id);
      draft.layers[index].visConfig.visible = !layer.visConfig.visible;
    });
    messageApi.success(layer.visConfig.visible ? '图层已隐藏' : '图层已显示', 1);
  };

  const onDelete = (_layer: LayerSchema) => {
    updateState((draft) => {
      const index = draft.layers.findIndex((layerInfo) => layerInfo.id === _layer.id);
      if (index !== -1) draft.layers.splice(index, 1);
    });
  };

  const copyLayer = (_layer: LayerSchema) => {
    const copyData = {
      ..._layer,
      metadata: {
        ..._layer.metadata,
        name: `${_layer.metadata.name}copy`,
      },
      id: getUniqueId(_layer.id),
    };
    updateState((draft) => {
      draft.layers.push(copyData);
    });
    messageApi.success('复制成功');
  };

  const dropDownItems: MenuProps['items'] = [
    {
      key: 'edit',
      label: '编辑图层',
      onClick() {
        onClickLayer(layer);
      },
    },
    {
      key: 'delete',
      label: (
        <Popconfirm
          title="确认是否删除？"
          placement="bottom"
          okText="确定"
          cancelText="取消"
          onConfirm={() => {
            onDelete(layer);
          }}
        >
          删除图层
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="li-layer-item" style={{ borderLeftColor: visLayer?.color }}>
      <div className="li-layer-item__drag-icon">{dragIcon}</div>
      <div className="li-layer-item__infor" onClick={(e) => e.stopPropagation()}>
        <div
          className="li-layer-item__title"
          onClick={() => {
            if (!isEditName) {
              onClickLayer(layer);
            }
          }}
        >
          <div className="li-layer-item__tag">
            {typeof visLayer?.icon === 'function' ? <Icon component={visLayer.icon} /> : null}
          </div>
          <LayerName
            name={layer.metadata.name}
            onChange={onChangeName}
            onClick={() => {
              if (!isEditName) {
                onClickLayer(layer);
              }
            }}
            onCancel={() => setIsEditName(false)}
            isEdit={isEditName}
          />
        </div>

        {messageContextHolder}
        <Space className="li-layer-item__actions">
          <Tooltip title="点击修改图层名称">
            <FormOutlined
              className={classnames('li-layer-item__actions_hide', 'li-layer-item__actions_show')}
              onClick={() => {
                setIsEditName(true);
              }}
            />
          </Tooltip>
          <Tooltip title="点击复制图层">
            <CopyOutlined
              className={classnames('li-layer-item__actions_hide', 'li-layer-item__actions_show')}
              onClick={() => copyLayer(layer)}
            />
          </Tooltip>

          <Tooltip title={`点击${layer?.visConfig?.visible ? '隐藏' : '显示'}图层`}>
            {layer?.visConfig?.visible ? (
              <EyeOutlined onClick={onVisibleChange} />
            ) : (
              <EyeInvisibleOutlined onClick={onVisibleChange} />
            )}
          </Tooltip>

          <Dropdown menu={{ items: dropDownItems }}>
            <MoreOutlined />
          </Dropdown>
        </Space>
      </div>
    </div>
  );
};

export default LayerItem;
