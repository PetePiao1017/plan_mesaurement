import { useState, useEffect, useRef } from "react";
import { PlusOutlined } from '@ant-design/icons';
import { Document, Page, pdfjs } from "react-pdf/dist/esm/entry.webpack";

import Scale from "./Scale";
import DraggableToolbar from "./DraggableToolbar";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./Main.css";
import DraggableWidget from "./DraggableWidget";
import { Divider } from "antd";



pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const App = () => {

  const categroy = ["ceiling", "Walls", "Floor", "General"];

  let pixelscale = 0;

  let start = {}
  let polytracker = []
  let isPoly = false;
  let shapeCount = 0;

  let prevs = [];

  const canvasRef = useRef(null);
  const annotationLayerRef = useRef(null);

  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const [listWidth, setlistWidth] = useState(null);
  const [listHeight, setlistHeight] = useState(null);
  const listRef = useRef(null);

  const [viewWidth, setviewWidth] = useState(null);
  const [viewHeight, setviewHeight] = useState(null);
  const viewRef = useRef(null);

  const [widgetData, setWidgetData] = useState([]);

  const [scaleValue, setScaleValue] = useState(100);
  const [prevState, setPrevState] = useState([]);
  const [drawType, setDrawType] = useState(null);
  const [dotCount, setDotCount] = useState(0);

  const [selectedOption, setSelectedOption] = useState('');

  // const [isOpen, setIsOpen] = useState(false);
  // const [selectedOption, setSelectedOption] = useState('option 1');

  // const toggleMenu = () => {
  //   setIsOpen(!isOpen);
  // };

  // const handleOptionSelect = (option) => {
  //   setSelectedOption(option);
  //   setIsOpen(false);
  // };

  const isOptionDisabled = (type) => {
    return type !== drawType;
  };

  const handleOptionSelect = (event) => {
    setSelectedOption(event.target.value);
  };

  const onFileChange = (e) => {
    const selectedfile = e.target.files[0]
    setFile(selectedfile);
    setPageNumber(1);
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  /*==========================List and Viewer Component Size Setting====================================*/

  useEffect(() => {
    const listElement = listRef.current;
    if (listElement) {
      const { width, height } = listElement.getBoundingClientRect();
      setlistWidth(width * 0.9);
      setlistHeight(height * 0.9);
    }

    const viewElement = viewRef.current;
    if (viewElement) {
      const {view_width, view_height} = viewElement.getBoundingClientRect();
      setviewHeight(view_height);
      setviewWidth(view_width);
    }
  }, [file]);

  const drawAnnotations = async () => {
    const fileReader = new FileReader();
    let uint8Array = new Uint8Array();
    
    fileReader.onload = () => {
      const arrayBuffer = fileReader.result;
      uint8Array = new Uint8Array(arrayBuffer);

      renderPdf(uint8Array);
    }

    fileReader.readAsArrayBuffer(file);
  };
  

  /*=======================File Upload==================================*/

  useEffect(() => {
    const canvas = document.getElementById("pdf-canvas");

    if (canvas) {
      drawAnnotations();
    }
  }, [file, pageNumber]);

  const renderPdf = async (data) => {
    const pdfjs = await import("pdfjs-dist/build/pdf");

    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

    const loadingTask = pdfjs.getDocument(data);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(pageNumber);

    const scale = 1.5;
    const viewport = page.getViewport({ scale });

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const annotationLayer = annotationLayerRef.current;
    annotationLayer.width = viewport.width;
    annotationLayer.height = viewport.height;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = {
      canvasContext: context,
      viewport,
    };

    await page.render(renderContext).promise;
  }; 


  /*=================================== Set the Scale ======================================*/

  const onScaleExplainModal = () =>{
    setDrawType("scale");
    showModal("explainScale");
    
  }

  const showModal = (id) => {
    var modal = document.getElementById(id);
    modal.style.display = "block";
    modal.classList.add("show");
  }

  const closeModal = (id) => {
    var modal = document.getElementById(id);
    modal.style.display = "none";
    modal.classList.remove("show");
  }

  const onSetScaleModal = () => {
    
    closeModal("explainScale");
  }

  const setScale = async () => {
    var scalelength = document.getElementById("scaleLength").value;
    setScaleValue(Math.ceil(scalelength / pixelscale))

    document.getElementById("scale").value = `1 : ${scaleValue}`;
    
    closeModal("setScale");
    prevs = [];
    draw();
  }

  /*===================Toolbar Setting==================================*/

  const settingDrawType = (type) => {
    setDrawType(type);
  }

  /*==================Drawing Annotation layer.========================*/



  const getMousePos = (canvas, e) => {
    var rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * canvas.width / rect.width,
      y: (e.clientY - rect.top) * canvas.height / rect.height,
    }
  }

  const draw = () => {
    const canvas = annotationLayerRef.current;
    var context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height)
    
    prevs && (prevs.forEach(item => {
      console.log("prevs = ", prevs);
      context.beginPath();
      if(item.type === "scale") {
        context.moveTo(item.x1, item.y1);
        context.lineTo(item.x2, item.y2);
        context.strokeStyle = 'red';
        context.lineWidth = "4";
        context.stroke();
      } else if(item.type === "line") {
        context.moveTo(item.x1, item.y1);
        context.lineTo(item.x2, item.y2);
        context.strokeStyle = 'red';
        context.lineWidth = "4";
        context.stroke();
      } else if(item.type === "rect") {
        context.rect(item.x, item.y, item.width, item.height);
        context.fillstyle = "rgba(255, 0, 0, 0.7)";
        context.fill();
      } else if(item.type === "poly") {

        var points = item.track;
        context.moveTo(points[0].x, points[0].y);
        for(var i = 1; i < points.length ; i++) {
            context.lineTo(points[i].x, points[i].y);
        }
        context.lineTo(points[0].x, points[0].y);
        context.fillStyle = "rgba(255, 0, 0, 0.7)";
        context.fill();
          
      } else if(item.type === "dot") {
        context.arc(item.x, item.y, 15, 0, 2 * Math.PI);
        context.fillStyle = 'rgba(255, 0, 0, 0.7)';
        context.fill();
      }
    }))
  
  
    prevState && (prevState.forEach(item => {
      console.log("prevState = ", prevState);
      context.beginPath();
      if(item.type === "line") {
        context.moveTo(item.x1, item.y1);
        context.lineTo(item.x2, item.y2);
        context.strokeStyle = 'red';
        context.lineWidth = "4";
        context.stroke();
      } else if(item.type === "rect") {
        context.rect(item.x, item.y, item.width, item.height);
        context.fillstyle = "rgba(255, 0, 0, 0.7)";
        context.fill();
      } else if(item.type === "poly") {

        var points = item.track;
        context.moveTo(points[0].x, points[0].y);
        for(var i = 1; i < points.length ; i++) {
            context.lineTo(points[i].x, points[i].y);
        }
        context.lineTo(points[0].x, points[0].y);
        context.fillStyle = "rgba(255, 0, 0, 0.7)";
        context.fill();
          
      } else if(item.type === "dot") {
        context.arc(item.x, item.y, 15, 0, 2 * Math.PI);
        context.fillStyle = 'rgba(255, 0, 0, 0.7)';
        context.fill();
      }
    }))
  
  }

  const mouseDownDraw = (e) => {
      const canvas = annotationLayerRef.current;

      start = getMousePos(canvas, e);
      if(drawType === "poly" && !isPoly) {
        isPoly = true;
        polytracker.push(start);
      }
  }

  const mouseMoveDraw = (e) => {
    const canvas = annotationLayerRef.current;
    var context = canvas.getContext("2d");

    if(start.x) {
      draw();
      
      let { x, y } = getMousePos(canvas, e);
      context.beginPath();
      if(drawType === "scale") {
        context.strokeStyle = "red";
        context.lineWidth = 4;
        context.moveTo(start.x, start.y);
        context.lineTo(x , y);
        context.stroke();
      } else if(drawType === "line") {
        const measureComp = document.getElementById("measure");
        measureComp.style.left = `${e.clientX + 30}px`;
        measureComp.style.top = `${e.clientY + 15}px`;
        measureComp.style.display = "block";

        context.strokeStyle = "red";
        context.lineWidth = 4;
        context.moveTo(start.x, start.y);
        context.lineTo(x , y);
        context.stroke();
        var diff = (Math.sqrt((x - start.x) * (x - start.x) + (y - start.y) * (y - start.y)) * scaleValue).toFixed(2);
        measureComp.innerText = `${diff} m`;

      } else if(drawType === "rect") {
        const measureComp = document.getElementById("measure");
        measureComp.style.left = `${e.clientX + 30}px`;
        measureComp.style.top = `${e.clientY + 15}px`;
        measureComp.style.display = "block";

        context.fillStyle = "rgba(255, 0, 0, 0.7)";
        context.rect(start.x, start.y, x - start.x, y - start.y);
        context.fill();

        diff = Math.abs((x - start.x) * (y - start.y) * scaleValue * scaleValue).toFixed(2);
        measureComp.innerText = `${diff} m2`;
      } else if(drawType === "poly" && isPoly) {

        context.strokeStyle = "red";
        context.lineWidth = "4";
        context.moveTo(polytracker[0].x, polytracker[0].y);

        let sumX = 0;
        let sumY = 0;

        for(var i = 1; i < polytracker.length; i++) {
          context.lineTo(polytracker[i].x, polytracker[i].y);
          context.stroke();
        }

        context.lineTo(x, y);
        context.stroke();

        if(polytracker.length > 1) {
          for( i = 0; i < polytracker.length - 1; i++) {
            sumX += polytracker[i].x * polytracker[i + 1].y;
            sumY += polytracker[i].y * polytracker[i + 1].x;
          }
          sumX += (polytracker[polytracker.length-1].x * y + y * polytracker[0].x);
          sumY += (polytracker[polytracker.length-1].y * x + x * polytracker[0].y);
        } 

        diff = (Math.abs(sumX - sumY) / 2 * scaleValue * scaleValue).toFixed(2);

        const measureComp = document.getElementById("measure");
        measureComp.style.left = `${e.clientX + 30}px`;
        measureComp.style.top = `${e.clientY + 15}px`;
        measureComp.style.display = "block";
        measureComp.innerText = `${diff} m2`;
      }
    }
  }

  const mouseMoveUp = (e) => {
    var canvas = annotationLayerRef.current
    if(drawType === "scale") {
      let {x, y} = getMousePos(canvas, e);
      
      prevs.push({type: "scale", x1: start.x, y1: start.y, x2: x, y2: y });
      pixelscale = Math.sqrt((x - start.x) * (x - start.x) + (y - start.y) * (y - start.y));
      start = {}
      draw()
      showModal("setScale");
    } else if (drawType === "line") {
      showModal("setLabel");
      shapeCount ++;
      let {x, y} = getMousePos(canvas, e);
      prevs.push({type: "line", number: shapeCount, x1: start.x, y1: start.y, x2: x, y2: y});
      setPrevState([
        ...prevState,
        {type: "line", number: shapeCount, x1: start.x, y1: start.y, x2: x, y2: y},
      ]);
      const measureComp = document.getElementById("measure");
      measureComp.style.display = "none";

      var diff = (Math.sqrt((x - start.x) * (x - start.x) + (y - start.y) * (y - start.y)) * scaleValue).toFixed(2);

      setWidgetData([
        ...widgetData,
        {type: "line", number: shapeCount, measure: `${diff} m`, result: `${diff} m`},
      ])

      start = {}
      draw()
    } else if (drawType === "rect") {
      showModal("setLabel");
      let {x, y} = getMousePos(canvas,e);
      prevs.push({type: "rect", number: shapeCount, x: start.x, y: start.y, width: x - start.x, height: y - start.y});
      setPrevState([
        ...prevState,
        {type: "rect", number: shapeCount, x: start.x, y: start.y, width: x - start.x, height: y - start.y}
      ]);

      diff = Math.abs((x - start.x) * (y - start.y) * scaleValue * scaleValue).toFixed(2);

      setWidgetData([
        ...widgetData,
        {type: "rect", number: shapeCount, measure: `${diff} m2`, result: `${diff} m2`},
      ])
      
      const measureComp = document.getElementById("measure");
      measureComp.style.display = "none";
      start = {}
      draw()
    } else if (drawType === "dot") {
      showModal("setLabel");
      setDotCount(dotCount + 1);
      prevs.push({type: "dot", number: shapeCount, x: start.x, y: start.y});
      setPrevState([
        ...prevState,
        {type: "dot", number: shapeCount, x: start.x, y: start.y}
      ])
      if(dotCount !== 0) {
        const newwidgetData = widgetData.map(item => {
          if(item.type === "dot") {
            return {...item, measure: `${dotCount + 1} count`, result: `${dotCount + 1} count`}
          }
          return item;
        })
        setWidgetData(newwidgetData);
      } else {
        setWidgetData([
          ...widgetData,
          {type: "dot", measure: `${dotCount + 1} count`, result: `${dotCount + 1} count`}
        ])
      }
      start = {}
      draw();
    } else if (drawType === "poly") {

      let {x, y} = getMousePos(canvas, e);

      const limit = 5;

      if(polytracker.length > 2) {
        var firstX = polytracker[0].x;
        var firstY = polytracker[0].y;

        
        diff = Math.sqrt((x - firstX) * (x - firstX) + (y - firstY) * (y - firstY));
        if(diff < limit) {
          isPoly = false;
          prevs.push({type: "poly", number: shapeCount, track: polytracker});
          setPrevState([
            ...prevState,
            {type: "poly", number: shapeCount, track: polytracker}
          ]);

          let sumX = 0;
          let sumY = 0;
          for (var i = 0; i < polytracker.length-1; i++) {
            sumX += polytracker[i].x * polytracker[i + 1].y;
            sumY += polytracker[i].y * polytracker[i + 1].x;
          }
          sumX += polytracker[polytracker.length-1].x * polytracker[0].y;
          sumY += polytracker[polytracker.length-1].y * polytracker[0].x;

          diff = (Math.abs(sumX - sumY) / 2 * scaleValue * scaleValue).toFixed(2);

          setWidgetData([
            ...widgetData,
            {type: "poly", measure: `${diff} m2`, result: `${diff} m2`}
          ])

          const measureComp = document.getElementById("measure");
          measureComp.style.display = "none";
          polytracker = [];
          draw();
        } else {
          polytracker.push({x, y});
        }
      } else {
        polytracker.push({x, y});
      }
    }
  }

  return (
    <div className="container-fluid">
      {
        !file ?
        <div id="upload_container">
          <label htmlFor="file-upload" className="custom-file-upload">
            <div id="upload_file" >
                  <PlusOutlined style={{margin:"auto"}} /> 
                  <p style={{textAlign:"center"}}>Upload</p>
            </div>
            <input type='file' onChange={onFileChange} id = "file-upload"  style={{display:"none"}} accept=".pdf"/>
          </label>
        </div>
        : ""

      }
        
      {
        file && (
          <div className="row">
            
            <div className="col-md-2" style={{backgroundColor: "#f5f5f5"}}>
              <div className="pagelist" ref={listRef}>
                <Document 
                    file={file} 
                    onLoadSuccess={onDocumentLoadSuccess}
                    style={{ height: "80vh", overflow: "auto"}}
                >
                  <div id="listpage">
                    {Array.from(Array(numPages), (e, i) => (
                      <div className="perpage" onClick={() => {setPageNumber(i + 1)}}>
                        <Page pageNumber={i + 1} width={listWidth} height={listHeight} />
                        <p className="pagenumber" style={{width: listWidth}}>{i + 1}</p>
                      </div>
                    ))}
                  </div>
                  <Scale onClick={onScaleExplainModal} viewscale ={scaleValue} />
                </Document>
              </div>
            </div>
            <div className="col-md-10 page"  ref={viewRef}>

            <DraggableToolbar onClick={settingDrawType} />
            <DraggableWidget widgetData={widgetData} />
            <div id="measure" style={{display: "none "}}>Hello</div>
              
              <div className="pageviewer">
                <canvas 
                  id="pdf-canvas" 
                  height={viewHeight} 
                  width={viewWidth} 
                  ref={canvasRef} 
                />
                <canvas 
                    id="annotation-canvas" 
                    height={viewHeight} 
                    width={viewWidth} 
                    ref={annotationLayerRef}
                    onMouseDown={mouseDownDraw}
                    onMouseMove={mouseMoveDraw}
                    onMouseUp={mouseMoveUp}
                    style={{ position: 'absolute', left: 0, top: 0, width: viewWidth, height: viewHeight }}
                />
              </div>  
            </div>
          </div>
        )
      }

      <div className="modal fade" id="explainScale" tabIndex="-1" aria-labelledby="confirmModalLabel" style={{display: "none"}} aria-hidden="false">
        <div className="modal-dialog">
          <div className="modal-content border border-3 border-dark" style={{backgroundColor: "#ffffff", border: "30px"}}>
            <div className="modal-header text-center">
              <h5 className="modal-title text-center fw-bold" id="confirmModalLabel1">Find Page Scale</h5>            
            </div>
            <div className="modal-body">
              <h6 className = "result">1. Measure an known length in the Page.Logger is better for accuracy</h6>
              <h6 className = "result">2. Double click to finish</h6>
              <h6 className = "result">3. Input lenght  according to plan can  1librate this page </h6>
            </div>
            <div className="modal-footer d-flex justify-content-between">
              <div></div>
              <div className="d-flex">
                <div ><button className="btn btn-defalut rounded border-2" onClick={onSetScaleModal}>Cancle</button></div>
                <div ><button className="btn btn-primary rounded border-2" onClick={onSetScaleModal}>OK</button></div>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="setScale" tabIndex="-1" aria-labelledby="confirmModalLabel" style={{display: "none"}} aria-hidden="false">
        <div className="modal-dialog">
          <div className="modal-content border border-3 border-dark" style={{backgroundColor: "#ffffff", border: "30px"}}>
            <div className="modal-header text-center">
              <h5 className="modal-title text-center fw-bold" id="confirmModalLabel1">Set Scale</h5>            
            </div>
            <div className="modal-body">
              <div><h6 className = "result">Enter the known measurements between the two points`(`m`)`</h6></div>
              <div><h6 className = "result"><b>Warning: </b> Only one scale is allowed per page. Setting the scale will update any existing measurements on this page.</h6></div>
              <div>
                <p style={{fontSize:"14px", margin: 0, padding: 0, backgroundColor:"transparent"}}><b>Meter</b></p>
                <input type="number" placeholder="ex: 56.65" style={{width:"100%"}} id="scaleLength" />
              </div>
            </div>
            <div className="modal-footer d-flex justify-content-between">
              <div></div>
              <div ><button className="btn btn-primary rounded border-2" onClick={setScale}>OK</button></div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="setLabel" tabIndex="-1" aria-labelledby="confirmModalLabel" style={{display: "none"}} aria-hidden="false">
        <div className="modal-dialog">
          <div className="modal-content border border-3 border-dark" style={{backgroundColor: "#ffffff", border: "30px"}}>
            <div className="modal-header text-center">
              <h5 className="modal-title text-center fw-bold" id="confirmModalLabel1">Set Label</h5>            
            </div>
            <div className="modal-body container-fluid">
              <div className="row header">
                <label className="col-md-4" for="heading">Heading</label>
                <input className="col-md-8" type="text" id="heading" />
              </div>
              
              <div className="row sub-header">
                <label className="col-md-4" for="subheading">Sub heading</label>
                <input className="col-md-8" type="text" id="subheading" />
              </div>

              {/* <div className="dropdown">
                <button className="dropdown-toggle" onClick={toggleMenu}>
                  {selectedOption ? selectedOption : 'Select an option'}
                </button>
                {isOpen && (
                  <ul className="dropdown-menu">
                    <li onClick={() => handleOptionSelect('Option 1')}>Option 1</li>
                    <li onClick={() => handleOptionSelect('Option 2')}>Option 2</li>
                    <li onClick={() => handleOptionSelect('Option 3')}>Option 3</li>
                  </ul>
                )}
              </div> */}
              <div className="dropdown row category">
                <label className="col-md-4" for="categry">Category</label>
                <select className="col-md-8" id="category" value={selectedOption} onChange={handleOptionSelect}>
                  <option value="">Select an option</option>
                  <option value="Ceiling" disabled={isOptionDisabled('rect')}>Ceiling</option>
                  <option value="Walls" disabled={isOptionDisabled('line')}>Walls</option>
                  <option value="Floor" disabled={isOptionDisabled('rect')}>Floor</option>
                  <option value="General" disabled={isOptionDisabled('dot')}>General</option>
                </select>
              </div>

              <div><h6 className = "result">Enter the known measurements between the two points`(`m`)`</h6></div>
              <div><h6 className = "result"><b>Warning: </b> Only one scale is allowed per page. Setting the scale will update any existing measurements on this page.</h6></div>
              <div>
                <p style={{fontSize:"14px", margin: 0, padding: 0, backgroundColor:"transparent"}}><b>Meter</b></p>
                <input type="number" placeholder="ex: 56.65" style={{width:"100%"}} id="scaleLength" />
              </div>
            </div>
            <div className="modal-footer d-flex justify-content-between">
              <div></div>
              <div ><button className="btn btn-primary rounded border-2" onClick={setScale}>OK</button></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default App;