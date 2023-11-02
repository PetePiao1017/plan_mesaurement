import Draggable from "react-draggable";

const DraggableWidget = ({widgetData}) => {
    return (
        <Draggable>
              <div className="draggableWidget row">
                <div className="widget-header">
                  <div className="col-md-4">
                    Name
                  </div>
                  <div className="col-md-3">
                    Measure
                  </div>
                  <div className="col-md-2">
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
                        <div className="col-md-4">
                          {data.type}
                        </div>
                        <div className="col-md-3">
                          {data.measure}
                        </div>
                        <div className="col-md-2">
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