import Draggable from "react-draggable"

const DraggableToolbar = ({onClick}) => {

    const handleDrawType = (type) => {
        onClick(type);
    }

    return (
        <Draggable>
            <div className="draggbletoolbar">
                <div className="btn btn-toolbar cursor" style={{textAlign: "center"}}>
                    <img src="./cursor.svg" alt="cursor icon"></img>
                </div>
                <div className="btn btn-toolbar rect" style={{textAlign: "center"}} onClick={() => handleDrawType("rect")}>
                    <img src="./rect.svg" alt="rect icon" />
                    <p style={{fontSize:"8px"}}>Rectangle</p>
                </div>
                <div className="btn btn-toolbar poly" style={{textAlign: "center"}} onClick={() => handleDrawType("poly")}>
                    <img src="./rect.svg" alt="poly icon" ></img>
                    <p style={{fontSize:"8px"}}>Polygon</p>
                </div>
                <div className="btn btn-toolbar length" style={{textAlign: "center"}} onClick={() => handleDrawType("line")}>
                    <img src="./rect.svg" alt="length icon" ></img>
                    <p style={{fontSize:"8px"}}>Length</p>
                </div>
                <div className="btn btn-toolbar deduct" style={{textAlign: "center"}}>
                    <img src="./rect.svg" alt="deduct icon" ></img>
                    <p style={{fontSize:"8px"}}>Deduct</p>
                </div>
                <div className="btn btn-toolbar count" style={{textAlign: "center"}} onClick={() => handleDrawType("dot")}>
                    <img src="./rect.svg" alt="count icon" ></img>
                    <p style={{fontSize:"8px"}}>Count</p>
                </div>
                <div className="btn btn-toolbar anno" style={{textAlign: "center"}}>
                    <img src="./rect.svg" alt="annotation icon" ></img>
                    <p style={{fontSize:"8px"}}>Annotate</p>
                </div>
                <div className="btn btn-toolbar undo" style={{textAlign: "center"}}>
                    <img src="./rect.svg" alt="undo icon" ></img>
                    <p style={{fontSize:"8px"}}>Undo</p>
                </div>
                <div className="btn btn-toolbar rotate" style={{textAlign: "center"}}>
                    <img src="./rect.svg" alt="rotate icon" ></img>
                    <p style={{fontSize:"8px"}}>Rotate</p>
                </div>
            </div>
        </Draggable>
    )
}

export default DraggableToolbar;