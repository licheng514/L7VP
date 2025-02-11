import Icon, { DownOutlined } from '@ant-design/icons';
import type { RadioChangeEvent } from 'antd';
import { Button, ConfigProvider, Dropdown, Form, InputNumber, message, Modal, Radio, Space, Tooltip } from 'antd';
import React, { useState } from 'react';
import { useEditorService, useEditorState } from '../../hooks';
import type { ImplementEditorWidgetProps } from '../../types';
import {
  AMAP_KEY as AMAP__KEY,
  BaseMapSvg,
  CLS_PREFIX,
  GaodeMapStyleConfig,
  MapboxStyleConfig,
  MAPBOX_TOKEN as MAPBOX__TOKEN,
} from './constant';
import { MapCenterModal } from './MapCenterModal';
import './MapSetting.less';

type MapSettingProps = ImplementEditorWidgetProps & {
  AMAP_KEY?: string;
  MAPBOX_TOKEN?: string;
};

const MapSetting: React.FC<MapSettingProps> = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const onClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Tooltip placement="right" title="地图初始化配置">
        <Button
          onClick={showModal}
          type="text"
          size="middle"
          shape="circle"
          icon={<Icon component={BaseMapSvg} style={{ fontSize: '18px' }} />}
        />
      </Tooltip>
      <MapSettingModal {...props} open={isModalOpen} onClose={onClose} />
    </>
  );
};

function MapSettingModal(props: { AMAP_KEY?: string; MAPBOX_TOKEN?: string; open: boolean; onClose: () => void }) {
  const { AMAP_KEY = AMAP__KEY, MAPBOX_TOKEN = MAPBOX__TOKEN, open, onClose } = props;
  const context = useEditorState();
  const appService = useEditorService().appService;
  const [mapCenterModalOpen, setMapCenterModalOpen] = useState(false);
  const [zoomValue, setZoomValue] = useState(context.state.map.config.zoom);
  const [mapCenterValue, setMapCenterValue] = useState(context.state.map.config.center);
  const [mapStyle, setMapStyle] = useState(context.state.map.config.style);
  const [mapType, setMapType] = useState(context.state.map.basemap);
  const [viewMode, setViewMode] = useState(context.state.map.config.viewMode || '2D');
  const [pitchValue, setPitchValue] = useState(context.state.map.config.pitch || 50);
  const [rotationValue, setRotationValue] = useState(context.state.map.config.rotation || 20);
  const [messageApi, messageContextHolder] = message.useMessage();

  const setSyncMapViewState = () => {
    const viewState = appService.getMapViewState();
    if (!viewState) return;

    const { zoom, center } = viewState;
    setZoomValue(zoom);
    setMapCenterValue([center.lng, center.lat]);
    messageApi.success('拾取成功');
  };

  const handleOk = () => {
    context.updateState((draft) => {
      // 关闭地图缓冲区，否则截图时无法截取到地图部分
      const drawingBufferConfig =
        mapType && ['Mapbox', 'Map'].includes(mapType)
          ? { preserveDrawingBuffer: true }
          : { WebGLParams: { preserveDrawingBuffer: true } };
      draft.map.basemap = mapType;
      const token = mapType !== 'Map' ? (mapType === 'Mapbox' ? MAPBOX_TOKEN : AMAP_KEY) : undefined;
      // mapBox\map 逆时针旋转更改顺时针
      const rotation = viewMode === '2D' ? 0 : mapType === 'Gaode' ? rotationValue : 360 - rotationValue;

      draft.map.config = {
        ...draft.map.config,
        token,
        zoom: zoomValue,
        center: mapCenterValue,
        style: mapType === 'Map' ? undefined : mapStyle,
        pitch: viewMode === '2D' ? 0 : pitchValue,
        rotation: rotation,
        viewMode: mapType === 'Gaode' ? viewMode : undefined,
        dragRotate: mapType === 'Mapbox' && viewMode === '2D' ? false : true,
        pitchWithRotate: mapType === 'Mapbox' && viewMode === '2D' ? false : true,
        ...drawingBufferConfig,
      };
    });
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const mapCenterModalOk = (mapCenter?: [number, number]) => {
    if (mapCenter) {
      setMapCenterModalOpen(false);
      setMapCenterValue(mapCenter);
    }
  };

  const drawModalCancel = () => {
    setMapCenterModalOpen(false);
  };

  const onZoomChange = (zoom: number | null) => {
    if (zoom) {
      setZoomValue(zoom);
    }
  };

  const onMapStyleClick = (e: { text: string; img?: string; type?: string }) => {
    setMapStyle(e.type);
  };

  const onMapTypeChange = (e: RadioChangeEvent) => {
    setMapType(e.target.value);
    setMapStyle('dark');
  };

  const onViewModeChange = (e: RadioChangeEvent) => {
    setViewMode(e.target.value);
  };

  const onPictChange = (e: number | null) => {
    setPitchValue(e ? e : 0);
  };

  const onRotationChange = (e: number | null) => {
    setRotationValue(e ? e : 0);
  };

  const dropDownItems = [
    {
      key: 'fromMap',
      label: '拾取当前地图',
      onClick: setSyncMapViewState,
    },
    {
      key: 'fromModal',
      label: '通过弹框拾取',
      onClick: () => {
        setMapCenterModalOpen(true);
      },
    },
  ];

  return (
    <>
      <Modal okText="保存" cancelText="取消" title="地图设置" open={open} onOk={handleOk} onCancel={handleCancel}>
        <ConfigProvider componentSize="small">
          <p className={`${CLS_PREFIX}__desc`}>设置地图初始化的中心点、缩放等级、底图样式</p>

          <Form layout="vertical" className={`${CLS_PREFIX}`}>
            <Form.Item label="地图中心点">
              <div className={`${CLS_PREFIX}__map-content`}>
                <div className={`${CLS_PREFIX}__map-content-text`}>{mapCenterValue?.toString()}</div>
              </div>
            </Form.Item>
            <Form.Item label="缩放等级">
              <InputNumber value={zoomValue} onChange={onZoomChange} precision={0} min={1} max={17} />
            </Form.Item>
          </Form>
          <div className={`${CLS_PREFIX}__select-map-center`}>
            <Dropdown
              placement="bottomRight"
              menu={{
                items: dropDownItems,
              }}
            >
              <Button type="link">
                <Space className={`${CLS_PREFIX}__select-map-center-text`}>
                  拾取
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </div>

          <div className={`${CLS_PREFIX}__view-mode`}>
            <div>视图模式</div>
            <Radio.Group onChange={onViewModeChange} value={viewMode}>
              <Radio.Button value="2D">2D</Radio.Button>
              <Radio.Button value="3D">3D</Radio.Button>
            </Radio.Group>
          </div>
          {viewMode === '3D' ? (
            <div className={`${CLS_PREFIX}__view-angle`}>
              <div className={`${CLS_PREFIX}__view-angle-item`}>
                <div>地图倾角</div>
                <InputNumber
                  className={`${CLS_PREFIX}__view-angle-item-input`}
                  min={0}
                  //  mapBox\map 地图倾斜角度最大为60
                  max={mapType === 'Gaode' ? 90 : 60}
                  width={110}
                  value={pitchValue}
                  onChange={onPictChange}
                />
              </div>
              <div className={`${CLS_PREFIX}__view-angle-item`}>
                <div>地图旋转</div>
                <InputNumber
                  className={`${CLS_PREFIX}__view-angle-item-input`}
                  min={0}
                  max={360}
                  value={rotationValue}
                  onChange={onRotationChange}
                />
              </div>
            </div>
          ) : null}
          <div className={`${CLS_PREFIX}__map-type`}>
            <div>底图样式</div>
            <Radio.Group onChange={onMapTypeChange} value={mapType}>
              <Radio.Button style={{ width: 70, textAlign: 'center' }} value="Gaode">
                高德
              </Radio.Button>
              <Radio.Button style={{ width: 100, textAlign: 'center' }} value="Mapbox">
                MapBox
              </Radio.Button>
              <Radio.Button style={{ width: 100, textAlign: 'center' }} value="Map">
                无底图
              </Radio.Button>
            </Radio.Group>
          </div>

          <div className={`${CLS_PREFIX}__style`}>
            {mapType === 'Gaode' &&
              GaodeMapStyleConfig.map((item) => {
                return (
                  <div key={item.text} className={`${CLS_PREFIX}__style-content`} onClick={() => onMapStyleClick(item)}>
                    <div
                      className={
                        mapStyle === item.type ? `${CLS_PREFIX}__style-item-active` : `${CLS_PREFIX}__style-item`
                      }
                    >
                      <img src={item.img} width={120} height={90} className={`${CLS_PREFIX}__style-item-img`} />
                    </div>
                    <div
                      className={
                        mapStyle === item.type
                          ? `${CLS_PREFIX}__style-item-text-active`
                          : `${CLS_PREFIX}__style-item-text`
                      }
                    >
                      {item.text}
                    </div>
                  </div>
                );
              })}

            {mapType === 'Mapbox' &&
              MapboxStyleConfig.map((item) => {
                return (
                  <div key={item.text} className={`${CLS_PREFIX}__style-content`} onClick={() => onMapStyleClick(item)}>
                    <div
                      className={
                        mapStyle === item.type ? `${CLS_PREFIX}__style-item-active` : `${CLS_PREFIX}__style-item`
                      }
                    >
                      <img src={item.img} width={120} height={90} className={`${CLS_PREFIX}__style-item-img`} />
                    </div>
                    <div
                      className={
                        mapStyle === item.type
                          ? `${CLS_PREFIX}__style-item-text-active`
                          : `${CLS_PREFIX}__style-item-text`
                      }
                    >
                      {item.text}
                    </div>
                  </div>
                );
              })}
          </div>
        </ConfigProvider>
      </Modal>
      {messageContextHolder}
      <MapCenterModal
        title="选择中心点"
        open={mapCenterModalOpen}
        onCancel={drawModalCancel}
        onSubmit={mapCenterModalOk}
        currentMapCenter={mapCenterValue as [number, number]}
        zoomValue={zoomValue as number}
        setZoomValue={setZoomValue}
        mapCenterModalOpen={mapCenterModalOpen}
      />
    </>
  );
}

export default MapSetting;
