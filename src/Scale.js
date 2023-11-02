const Scale = (props) => {

    // document.getElementById("scale").value = `1 : ${props.viewscale}`;

    return (
        <div id="set-scale">
            <hr></hr>
            <div>PAGE SETTINGS</div>
            <hr />
            <div className="page_setting row">
                <p className="col-md-5" style={{fontSize:"12px", marginBottom: "0"}}>Line Width</p>
                <div class="col-md-7">
                    <select >
                        <option className="w1">&#9472;&#9472;&#9472;&#9472; 1.0</option>
                        <option className="w2">&#9472;&#9472;&#9472;&#9472; 2.0</option>
                        <option className="w3">&#9472;&#9472;&#9472;&#9472; 3.0</option>
                        <option className="w4">&#9472;&#9472;&#9472;&#9472; 4.0</option>
                        <option className="w5">&#9472;&#9472;&#9472;&#9472; 5.0</option>
                        <option className="w6">&#9472;&#9472;&#9472;&#9472; 6.0</option>
                    </select> 
                </div>
            </div>
            <div className="page_setting row">
                <p className="col-md-5" style={{fontSize:"12px", marginBottom:0}}>Page scale</p>
                <input 
                    className="col-md-7" 
                    type="text" 
                    readOnly 
                    value = {`1: ${props.viewscale}`}
                    id ="scale" 
                    textAlign="center" />            
                </div>
            <button className="btn btn-primary" onClick={() => props.onClick()}>Find Scale</button>
        </div>
    )
}

export default Scale;