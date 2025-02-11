import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import { useEditorState } from '../../hooks';
import type { ImplementEditorWidgetProps } from '../../types';
import AddDataset from './AddDataset';
import DatasetList from './DatasetList';
import './DatasetsPanel.less';
import PreviewDataset from './PreviewDataset';

interface DatasetsPanelProps extends ImplementEditorWidgetProps {
  className?: string;
}

const DatasetsPanel: React.FC<DatasetsPanelProps> = (props: DatasetsPanelProps) => {
  const { className } = props;
  const { state } = useEditorState();
  const [addDatasetVisible, setAddDatasetVisible] = useState(false);
  const [previewdatasetId, setPreviewDatasetId] = useState<string>('');
  const [previewDatasetVisible, setPreviewDatasetVisible] = useState(false);

  return (
    <div className={classNames('li-datasets-panel', className)}>
      <div className="li-datasets-panel__header">数据</div>
      <div className="li-datasets-panel__add-dataset">
        <span>数据集({state.datasets.length})</span>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setAddDatasetVisible(true);
          }}
          id="LITourAddDataset"
        >
          新增数据集
        </Button>
      </div>

      <DatasetList
        className="li-datasets-panel__dataset-list"
        onPreviewDataset={(datasetId) => {
          setPreviewDatasetId(datasetId);
          setPreviewDatasetVisible(true);
        }}
      />

      <AddDataset visible={addDatasetVisible} onClose={() => setAddDatasetVisible(false)} />
      {previewDatasetVisible && (
        <PreviewDataset
          visible={previewDatasetVisible}
          onClose={() => setPreviewDatasetVisible(false)}
          datasetId={previewdatasetId}
        />
      )}
    </div>
  );
};

export default DatasetsPanel;
