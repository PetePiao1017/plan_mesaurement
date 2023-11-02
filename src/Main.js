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
import { Modal, InputNumber, Input } from "antd";



pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const App = () => {

  let shapeCount = 0;

  let prevs = [];

  

  const ceilcategory = ["Plasterboard", "Plastering", "Painting"];
  const wallcategory = ["Plasterboard", "Plastering", "Painting", "Trims Paint"];
  const floorcategory = ["Concrete"];
  const generalcategory = ["Doors", "Windows"];

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
  const [subCategory, setSubCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState('');

  const [labelheader, setLabelHeader] = useState("");
  const [labelsubheader, setLabelSubHeader] = useState("");
  const [labelcategory, setLabelCategory] = useState("");
  const [labelsubcategory, setLabelSubCategory] = useState("");
  const [islabel, setIsLabel] = useState(false);

  const [isFindScaleModalOpen, setIsFindScaleModalOpen] = useState(false);
  const [isSetScaleModalOpen, setIsSetScaleModalOpen] = useState(false);
  const [pixelscale, setPixelscale] = useState(0);
  const [isSetLabelOpen, setIsSetLabelOpen] = useState(false);
  const [ismeasurelabel, setIsmeasurelabel] = useState(false);
  const [diff, setDiff] = useState("");
  const [mouseXpoint, setMouseXpoint] = useState(0.0);
  const [mouseYpoint, setMouseYpoint] = useState(0.0);
  const [start, setStart] = useState({});
  const [polytracker, setPolytracker] = useState([]);
  const [isPoly, setIsPoly] = useState(false);

  // Change function for input scale
  const onChange = (value) => {

    setScaleValue(Math.ceil(
      (parseInt(value) / pixelscale)));
  }
  

  /*===============Set Label===============*/
  const isCategoryDisabled = (type) => {
    // console.log("type1 = ", type1);
    console.log("type = ", type);

    return type !== drawType
  };

  const handleCategorySelect = (event) => {
    setLabelCategory(event.target.value);
    switch(event.target.value) {
      case "Ceiling" :
        setSubCategory(ceilcategory);
        break;
      case "Walls" :
        setSubCategory(wallcategory);
        break;
      case "Floor" :
        setSubCategory(floorcategory);
        break;
      case "General" :
        setSubCategory(generalcategory);
        break;
      default: break;
    }
  };

  const handleSubCategorySelect = (e) => {
    setLabelSubCategory(e.target.value)
  }

  const onheaderChange = (e) => {
    setLabelHeader(e.target.value);
  }

  const onSubheaderChange = (e) => {
    setLabelSubHeader(e.target.value);
  }

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

  const onFileChange = (e) => {
    const selectedfile = e.target.files[0]
    setFile(selectedfile);
    setPageNumber(1);
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

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

/*================= Modal Action(OK/Cancel) ===================== */

  const handleOk = (str, type) => {
    switch(str){
      case "findpagescale":
        setIsFindScaleModalOpen(false);
        setDrawType("scale");
        break
      case "setscale":
        setIsSetScaleModalOpen(false);
        prevs = [];
        draw();
        break
      case "setlabel":
        
        
        setIsSetLabelOpen(false);
        setWidgetData([
          ...widgetData,
          { 
            area: labelheader, 
            subarea: labelsubheader, 
            category: labelcategory, 
            subcategory: labelsubcategory, 
            type: type, number: shapeCount, 
            measure: `${diff} m`, 
            result: `${diff} m`},
        ])
      default:
        break
    }
  };
  const handleCancel = () => {
    setIsFindScaleModalOpen(false);
  };

  /*===================Toolbar Setting==================================*/

  const settingDrawType = (type) => {
    setDrawType(type);
  }

{/*==================Drawing Annotation layer.========================*/}



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

      setStart(getMousePos(canvas,e));
      if(drawType === "poly" && !isPoly) {
        setIsPoly(true);
        setPolytracker([...polytracker, getMousePos(canvas, e)]);
      }
  }

  const mouseMoveDraw = (e) => {
    const canvas = annotationLayerRef.current;
    var context = canvas.getContext("2d");
    
    setMouseXpoint(e.clientX);
    setMouseYpoint(e.clientY);

    if(start.x) {
      draw();
      let { x, y } = getMousePos(canvas, e);
      context.beginPath();

      switch(drawType){
        case "scale":
          context.strokeStyle = "red";
          context.lineWidth = 4;
          context.moveTo(start.x, start.y);
          context.lineTo(x , y);
          context.stroke();
          break
        case "line":
          setIsmeasurelabel(true);
          context.strokeStyle = "red";
          context.lineWidth = 4;
          context.moveTo(start.x, start.y);
          context.lineTo(x , y);
          context.stroke();
          setDiff((Math.sqrt((x - start.x) * (x - start.x) + (y - start.y) * (y - start.y)) * scaleValue).toFixed(2).toString());
          break
        case "rect":
          setIsmeasurelabel(true);
          context.fillStyle = "rgba(255, 0, 0, 0.7)";
          context.rect(start.x, start.y, x - start.x, y - start.y);
          context.fill();
          setDiff(Math.abs((x - start.x) * (y - start.y) * scaleValue * scaleValue).toFixed(2).toString());
          break
        case "poly":
          if(isPoly){
            setIsmeasurelabel(true);
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
    
            setDiff((Math.abs(sumX - sumY) / 2 * scaleValue * scaleValue).toFixed(2).toString());
          }
      }
    }
  }

  const mouseMoveUp = (e) => {
    var canvas = annotationLayerRef.current;
    let {x, y} = getMousePos(canvas, e);

    switch(drawType){
      case "scale":
        prevs.push({type: "scale", x1: start.x, y1: start.y, x2: x, y2: y });
        setPixelscale(Math.sqrt((x - start.x) * (x - start.x) + (y - start.y) * (y - start.y)));
        setStart({});
        draw()
        setIsSetScaleModalOpen(true);
        break
      case "line":
        setIsSetLabelOpen(true);
        shapeCount ++;
        prevs.push({type: "line", number: shapeCount, x1: start.x, y1: start.y, x2: x, y2: y});
        setPrevState([
          ...prevState,
          {type: "line", number: shapeCount, x1: start.x, y1: start.y, x2: x, y2: y},
        ]);
        setIsmeasurelabel(false);

        setDiff((Math.sqrt((x - start.x) * (x - start.x) + (y - start.y) * (y - start.y)) * scaleValue).toFixed(2).toString());

       
        setStart({});
        draw()
        break
      case "rect":
        setIsSetLabelOpen(true);
        prevs.push({type: "rect", number: shapeCount, x: start.x, y: start.y, width: x - start.x, height: y - start.y});
        setPrevState([
          ...prevState,
          {type: "rect", number: shapeCount, x: start.x, y: start.y, width: x - start.x, height: y - start.y}
        ]);

        setDiff(Math.abs((x - start.x) * (y - start.y) * scaleValue * scaleValue).toFixed(2).toString());

        
        
        setIsmeasurelabel(false);

        setStart({});
        draw()
        break
      case "poly":
        const limit = 5;
        if(polytracker.length > 2) {
          var firstX = polytracker[0].x;
          var firstY = polytracker[0].y;

          
          setDiff(Math.sqrt((x - firstX) * (x - firstX) + (y - firstY) * (y - firstY)).toString());
          let temp = Math.sqrt((x - firstX) * (x - firstX) + (y - firstY) * (y - firstY));
          if(temp < limit) {
            setIsPoly(false);
            
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

            setDiff((Math.abs(sumX - sumY) / 2 * scaleValue * scaleValue).toFixed(2).toString());

           

            setIsmeasurelabel(false);

            setPolytracker([]);
            draw();
            setIsSetLabelOpen(true);
          } else {
            setPolytracker([...polytracker, {x,y}]);
          }
        } else {
          setPolytracker([...polytracker, {x,y}]);
        }
        break
      case "dot":
        setIsSetLabelOpen(true);
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
            {area: labelheader, subarea: labelsubheader, category: labelcategory, subcategory: labelsubcategory, type: "dot", measure: `${dotCount + 1} count`, result: `${dotCount + 1} count`}
          ])
        }
        start = {}
        draw();
        break
      default:
        break
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
                  <Scale onClick={() => setIsFindScaleModalOpen(true)} viewscale ={scaleValue} />
                </Document>
              </div>
            </div>
            <div className="col-md-10 page"  ref={viewRef}>

            <DraggableToolbar onClick={settingDrawType} />
            <DraggableWidget widgetData={widgetData}  />
            {
              ismeasurelabel ? <h5 style={{
                position: "absolute",
                top: `${mouseYpoint + 30}px`,
                left: `${mouseXpoint + 15}px`,
                zIndex: "1000",
              }}>{
                drawType === "line" ? `${diff}m` : `${diff}m2`
                }</h5> : ""
            }
              
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

      
      {/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */}
      {/* Modal for Fing Page Scale */}

      <Modal 
        title = "Find Page Scale"
        open= {isFindScaleModalOpen}
        onOk = {() => handleOk("findpagescale")}
        onCancel={handleCancel}  
      >
        <h6 className = "result">
          1. Measure an known length in the Page.Logger is better for accuracy
        </h6>
        <h6 className = "result">
          2. Double click to finish
        </h6>
        <h6 className = "result">
          3. Input lenght  according to plan can  1librate this page 
        </h6>
      </Modal>

      {/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */}
      {/* Modal For Set Scale */}
      <Modal 
        title = "Set Scale"
        open = {isSetScaleModalOpen}
        onOk = {() => handleOk("setscale")}
        >
            <div>
              <h6 className = "result">
                Enter the known measurements between the two points`(`m`)`
              </h6>
            </div>
            <div><h6 className = "result">
              <b>Warning: </b> Only one scale is allowed per page. Setting the scale will update any existing measurements on this page.
              </h6>
            </div>
            <div>
                <p 
                  style={{
                    fontSize:"14px", 
                    margin: 0, 
                    padding: 0, 
                    backgroundColor:"transparent"
                  }}>
                  <b>Meter</b>
                </p>
                <InputNumber 
                  placeholder="ex: 56.65" 
                  style={{width:"100%"}}  
                  onChange={onChange}  
                />
              </div> 
      </Modal>
        
      {/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */}
      {/* Modal for Set Label */}
      <Modal 
        title = "Set Label"
        open = {isSetLabelOpen}
        onOk = { () => handleOk("setlabel", drawType)}
        onCancel={handleCancel}
      >
        <div className="row header">
          <label className="col-md-4" for="heading">Heading</label>
          <Input 
            className="col-md-8" 
            type="text" 
            name = "header" 
            placeholder = "Unit 1"
            value = {labelheader}
            onChange = {onheaderChange}
          />
        </div>
              
        <div className="row sub-header">
          <label className="col-md-4" for="subheading">Sub heading</label>
          <Input 
            className="col-md-8" 
            type="text" 
            name = "subheader"
            placeholder = "Kitchen"
            value = {labelsubheader}
            onChange = {onSubheaderChange}
          />
        </div>

        <div className="dropdown row category">
          <label className="col-md-4" for="categry">Category</label>
          <select className="col-md-8" id="category" value={labelcategory} onChange={handleCategorySelect}>
            <option value="" disabled>Select an option</option>
            <option value="Ceiling" disabled={isCategoryDisabled('rect')}>Ceiling</option>
            <option value="Walls" disabled={isCategoryDisabled('line')}>Walls</option>
            <option value="Floor" disabled={isCategoryDisabled('rect')}>Floor</option>
            <option value="General" disabled={isCategoryDisabled('dot')}>General</option>
          </select>
        </div>

        <div className="dropdown row subcategory">
          <label className="col-md-4" for="sub-category">Sub-Category</label>
          <select className="col-md-8" id="sub-category" value={labelsubcategory} onChange={handleSubCategorySelect}>
            
              <option value="" disabled>Select an option</option>
            {
              subCategory && subCategory.map((index) => (
                  <option value={index}>{index}</option>
              ))
            }
          </select>
        </div>
      </Modal>
    </div>
  );
};

export default App;