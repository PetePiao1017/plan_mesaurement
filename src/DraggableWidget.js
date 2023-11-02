import { Input } from "antd";
import Modal from "antd/es/modal/Modal";
import { useEffect } from "react";
import { useState } from "react";
import Draggable from "react-draggable";

const DraggableWidget = (props) => {
  const [data, setData]  =useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  useEffect(() => {
    setData(props.widgetData)
  },[props.widgetData])

  
  const handleDimension = (e, index) => {
    const selectedData = data[index];
    setSelectedData(selectedData);
    setIsOpenModal(true);
  };

  const onOK = () => {
    setIsOpenModal(false);
  }

  const onCancel = () => {
    setIsOpenModal(false);
  }

  const onDepthChange = (e) => {
    setSelectedData({
      ...selectedData,
      result: selectedData.measure + e.target.value
    })
    selectedData.result = selectedData.measure
  }

    return (<>
        <Draggable>
              <div className="draggableWidget row">
                <div className="widget-header">
                  <div className="col-md-1">
                    Area
                  </div>
                  <div className="col-md-1">
                    Sub_Area
                  </div>
                  <div className="col-md-1">
                    Category
                  </div>
                  <div className="col-md-2">
                    Sub_Category
                  </div>
                  <div className="col-md-1">
                    Name
                  </div>
                  <div className="col-md-2">
                    Measure
                  </div>
                  <div className="col-md-1">
                    HDP
                  </div>
                  <div className="col-md-3">
                    Result
                  </div>
                </div>
                <div className="draggable">
                  {
                    data.map((data, index) => {
                      return (
                      <div className="widget-content" key={index}>
                        <div className="col-md-1">
                          {data.area}
                        </div>
                        <div className="col-md-1">
                          {data.subarea}
                        </div>
                        <div className="col-md-1">
                          {data.category}
                        </div>
                        <div className="col-md-2">
                          {data.subcategory}
                        </div>
                        <div className="col-md-1">
                          {data.type}
                        </div>
                        <div className="col-md-2">
                          {data.measure}
                        </div>
                        <div className="col-md-1" style={{cursor: "pointer"}} onClick={(e) => handleDimension(e,index)}>
                          HDP
                        </div>
                        <div className="col-md-3">
                          {data.result}
                        </div>
                      </div>
                    )})
                  }
                </div>
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
                      <div className="col-md-2 p-0">{selectedData.subarea}</div>
                      <div className="col-md-2 p-0">{selectedData.category}</div>
                      <div className="col-md-2 p-0">{selectedData.subcategory}</div>
                      <div className="col-md-1 p-0">{selectedData.type}</div>
                      <div className="col-md-3 p-0">{selectedData.measure}</div>
                    </div>
                    <br />
                    <div className="row">
                      <div className="col-md-4 p-0">
                        <label>Height/Width</label>
                        <Input 
                          type="number" 
                          name = "height" 
                          placeholder = {0}
                        />
                      </div>
                      <div className="col-md-4 p-0">
                        <label>Depth</label>
                        <Input 
                          type="number" 
                          name = "depth" 
                          placeholder = {0}
                          onChange={onDepthChange}
                        />
                      </div>
                      <div className="col-md-4 p-0">
                        <label>Pitch</label>
                        <Input 
                          type="number" 
                          name = "pitch" 
                          placeholder = {0}
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

export default DraggableWidget;