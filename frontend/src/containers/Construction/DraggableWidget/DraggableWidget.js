import { Input, Button, Select } from "antd";
import Modal from "antd/es/modal/Modal";
import { useEffect } from "react";
import {connect} from 'react-redux';
import { useState } from "react";
import Draggable from "react-draggable";
import Row from "./Row";
import { exportToExcel } from 'react-json-to-excel';

import {saveResult} from '../../../actions/result';

const DraggableWidget = (props) =>  {
  const [data, setData]  =useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [previousmeasure, setPreviousMeasure] = useState(0);
  const [height, setHeight] = useState(1);
  const [depth, setDepth] = useState(1);
  const [pitch, setPitch] = useState(0);

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setData(props.widgetData)
  },[props.widgetData])

  const { Option } = Select;
  
  const handleDimension = (index) => {
    const selectedRow = data[index];
    setSelectedIndex(index);
    setSelectedData(selectedRow);
    setPreviousMeasure(selectedRow.measure);
    setIsOpenModal(true);
  };

  const onOK = () => {
    const newData = [...data];
    newData[selectedIndex] = selectedData;
    setData(newData);
    setIsOpenModal(false);
  }

  const onCancel = () => {
    setIsOpenModal(false);
  }

  const onDepthChange = (e) => {
    if(e.target.value)
      {setDepth(e.target.value);}
    else {setDepth(1);}

    setSelectedData({
      ...selectedData,
      result: previousmeasure * height * (e.target.value ? e.target.value : 1) *(1 + pitch / 100)
    })
    selectedData.result = selectedData.result
  }

  const onHeightChange = (e) => {
    if(e.target.value)
      setHeight(e.target.value);
    else
      setHeight(1);
    setSelectedData({
      ...selectedData,
      result:previousmeasure * depth * (e.target.value ? e.target.value : 1) * (1 + pitch / 100)
    })
  }

  const onPitchChange = (e) => {
    if(e.target.value) setPitch(e.target.value);
    else setPitch(0);
    setSelectedData({
      ...selectedData,
      result:previousmeasure * depth * height * (1 + e.target.value / 100)
    })
  }

  const saveDatabase = () => {
    data && data.map((item) => props.saveResult(item));
  }

  const ExportExcel = () => {
    console.log(data[0])
    const temp = data.map(item => {
      let temp_price = "";
      let temp_subcategory = "";
      item.price.forEach(element => temp_price += "," + element);
      item.subcategory.forEach(element => temp_subcategory += "," + element);
      let tempObj = {
        area: item.area,
        category: item.category,
        measure: item.measure,
        price: temp_price,
        result: item.result,
        subarea: item.subarea,
        subcategory: temp_subcategory,
        type: item.type,
        unit: item.unit,
      }

      return tempObj
    })
    exportToExcel(temp, 'measure')
  }

    return (
    <>
        <Draggable>
          <div className="draggableWidget row">
            <div className="widget-header">
              <div className="col-md-1 text-center">
                Area
              </div>
              <div className="col-md-1 text-center">
                SubArea
              </div>
              <div className="col-md-1 text-center">
                Category
              </div>
              <div className="col-md-2 text-center">
                SubCategory
              </div>
              <div className="col-md-1 text-center">
                Type
              </div>
              <div className="col-md-1 text-center">
                Unit
              </div>
              <div className="col-md-1 text-center">
                Measure
              </div>
              <div className="col-md-1 text-center">
                HDP
              </div>
              <div className="col-md-1 text-center">
                Result
              </div>
              <div className="col-md-2 text-center">
                Price($)
              </div>
            </div>
            <div className="draggable">
              {
                data.map((data, rowindex) => {
                  return (
                  <Row index={rowindex} data={data} onClick={handleDimension} />
                )})
              }
            </div>
            {
              (data.length !== 0) && (
                <div className="widget-footer">
                  <Button type="primary" onClick={ExportExcel}>Export to Excel</Button>
                  <Button type="primary" onClick={saveDatabase}>Save Database</Button>
                </div>
              )
            }
            
          </div>
        </Draggable>

            <Modal
              title = "Add Dimension"
              open = {isOpenModal}
              onOk = {onOK}
              onCancel={onCancel}
            >
              {
                selectedData && (
                  <div>
                    <div className="row">
                      <div className="col-md-2 p-0">{selectedData.area}</div>
                      <div className="col-md-3 p-0">{selectedData.subarea}</div>
                      <div className="col-md-2 p-0">{selectedData.category}</div>
                      <div className="col-md-2 p-0">{selectedData.type}</div>
                      <div className="col-md-3 p-0">{selectedData.measure}</div>
                    </div>
                    <br />
                    <div className="row">
                      <div className="col-md-4 p-0">
                        <label>Height/Width(m)</label>
                        <Input 
                          type="number" 
                          name = "height" 
                          onChange={onHeightChange}
                          placeholder = {0}
                        />
                      </div>
                      <div className="col-md-4 p-0">
                        <label>Depth(m)</label>
                        <Input 
                          type="number" 
                          name = "depth" 
                          placeholder = {0}
                          onChange={onDepthChange}
                        />
                      </div>
                      <div className="col-md-4 p-0">
                        <label>Pitch(%)</label>
                        <Input 
                          type="number" 
                          name = "pitch" 
                          placeholder = {0}
                          onChange={onPitchChange}
                        />
                      </div>
                    </div>
                    <br />
                    <div className="row">
                      <div className="col-md-4">Total</div>
                      <div className="col-md-4"></div>
                      <div className="col-md-4">{selectedData.result}</div>
                    </div>
                  </div>
                )
              }
              
            </Modal>

      </>

    )
}

export default connect(null, {saveResult})(DraggableWidget) ;