import Draggable from "react-draggable";

const DraggableWidget = ({widgetData}) => {
    return (
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
                    widgetData.map((data, index) => {
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
                        <div className="col-md-1">
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
    )
}

export default DraggableWidget;