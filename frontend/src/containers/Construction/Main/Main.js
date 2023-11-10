import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { connect } from 'react-redux';

import { Modal, Select, Input, FloatButton } from "antd";
import { PlusOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { Document, Page, pdfjs } from "react-pdf/dist/esm/entry.webpack";
import { retrieveData } from "../../../actions/admin";

import Scale from "../Scale/Scale";
import DraggableToolbar from "../DraggableToolbar/DraggableToolbar";
import DraggableWidget from "../DraggableWidget/DraggableWidget";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./Main.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const App = (props) => {

  const { Option } = Select;

  let prevs = [];

  {/*=================== Use Ref Making for Canvas =================== */}
  const canvasRef = useRef(null);
  const annotationLayerRef = useRef(null);

  {/*=================== File Upload =================== */}

  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  {/*======== Set Page List Section Setting ======*/}

  const [listWidth, setlistWidth] = useState(null);
  const [listHeight, setlistHeight] = useState(null);
  const listRef = useRef(null);

  {/*======== Set Canvas Section Setting ======*/}

  const [canvasWidth, setcanvasWidth] = useState(null);

  {/*======== Set widget Data Store ======*/}
  const [widgetData, setWidgetData] = useState([]);

  {/*======== Set Page Setting ======*/}

  const [pageScale, setPageScale] = useState("100");
  const [selectScaleValue, setSelectScaleValue] = useState("100");

  const [pageSize, setPageSize] = useState("A1");
  const [selectSizeValue, setSelectSizeValue] = useState("A1");

  {/*======== Set Single/Double Click ======*/}
  const [clickTimer, setClickTimer] = useState(null);

  {/*======== Set Modal Open ======*/}
  const [isSetScaleModalOpen, setIsSetScaleModalOpen] = useState(false);
  const [isChangeScaleModalOpen, setIsChangeScaleModalOpen] = useState(false);

  {/*======= Drawing Start Point ===============*/}
  const [startPoint, setStartPoint] = useState({});

  {/*========= Drawing Possible ========== */}
  const [isDrawing, setIsDrawing] = useState(false);

  {/*========= Value Display Possible ========== */}
  const [isDisplayValue, setIsDisplayValue] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);

  {/*======= Mouse Position ============== */}
  const [mousePointX, setMousePointX] = useState(0);
  const [mousePointY, setMousePointY] = useState(0);

  {/*=============== Layout Size ================ */}
  const [layoutSize, setLayoutSize] = useState(0);

  {/*============= Zoom Scale Setting ========== */}
  const [zoomScale, setZoomScale] = useState(1);

  {/*======== Draw Type =============== */}
  const [drawType, setDrawType] = useState(null);

  {/*========= Polygon drawing Start Possible ==========*/}
  // const [isPolyStart, setIsPolyStart] = useState(false);

  {/*=========== Polygon dots Tracker ===============*/}
  const [polyTracker, setPolyTracker] = useState([]);

  {/*============= PolyLine Dots tracker =========== */}
  const [polyLineTracker, setPolyLineTracker] = useState([]);

  {/*========== Previous Shape Drawing Store ================ */}
  const [prevState, setPrevState] = useState([]);

  {/*============ Label Set Modal Open ================ */}
  const [isSetLabelOpen, setIsSetLabelOpen] = useState(false);

  {/*============= Category Select List =============== */}
  const [categorySelectList, SetCategorySelectList] = useState([]);
  const [subCategorySelectList, setSubCategorySelectList] = useState([]);

  {/*===================== Set Label Values ================ */}
  const [labelheader, setLabelHeader] = useState("");
  const [labelsubheader, setLabelSubHeader] = useState("");
  const [labelcategory, setLabelCategory] = useState("");
  const [labelsubcategory, setLabelSubCategory] = useState([]);


  {/*========= Measure Value============= */}
  const [previouslength, setPreviousLegth] = useState(0);

  const [dotNum, setDotNum] = useState(0);

  {/*==================== UseEffect ==========================*/}

  useEffect(() => {
    const canvas = document.getElementById("pdf-canvas");

    if (canvas) {
      drawAnnotations();
    }
    setPrevState([])

  }, [file, pageNumber]);

  useEffect(() => {
    return () => {
      clearTimeout(clickTimer);
    };
  }, [clickTimer]);

  useEffect(() => {
    props.retrieveData();
  },[]);

  useEffect(() => {
    const listElement = listRef.current;
    if (listElement) {
      const { width, height } = listElement.getBoundingClientRect();
      setlistWidth(width * 0.9);
      setlistHeight(height * 0.9);
    }
  }, [file]);

  {/*============================================ */}
  {/*Page Setting function */}


  const onhandleSetPageScaleSelect = (e) => {
    setSelectScaleValue(e.target.value);
  }

  const onhandleSetPageSizeSelect = (e) => {
    setSelectSizeValue(e.target.value);
  }

  const onOkSetScaleModal = () => {
    const categorylist = props.data.map((item) => {return item.name});
    SetCategorySelectList(categorylist);
    setPageScale(selectScaleValue);
    setPageSize(selectSizeValue);
    switch(selectSizeValue) {
      case "A0":
        setLayoutSize(1189);
        break;
      case "A1":
        setLayoutSize(841);
        break;
      case "A2":
        setLayoutSize(594);
        break;
      case "A3":
        setLayoutSize(420);
        break;
      case "A4":
        setLayoutSize(297);
        break;
      case "A5":
        setLayoutSize(210);
        break;
      case "A6":
        setLayoutSize(148.5);
        break;
      default:
        break;
    }
    setIsSetScaleModalOpen(false);
  }

  const onOkChangeScaleModal = () => {
    setPageScale(selectScaleValue);
    setIsChangeScaleModalOpen(false);
  }

  const onCloseSetScaleModal = () => {
    setIsSetScaleModalOpen(false);
  }

  const onCloseChangeScaleModal = () => {
    setIsChangeScaleModalOpen(false);
  }
  {/*===============Set Label===============*/}
  const isCategoryDisabled = (type) => {
    return type !== drawType
  };

  const handleCategorySelect = (event) => {
    setLabelCategory(event.target.value);
    const seletedCategoryData = props.data.filter(item => item.name === event.target.value);
    const subcategorylist = JSON.parse(seletedCategoryData[0].subcategory);
    const list = subcategorylist.map((index) => {
      return {value: index.item, label: index.item};
    })
    setSubCategorySelectList(list);
  };

  const handleSubCategorySelect = (selectedOptions) => {
    setLabelSubCategory(selectedOptions);
  }

  const onheaderChange = (e) => {
    setLabelHeader(e.target.value);
  }

  const onSubheaderChange = (e) => {
    setLabelSubHeader(e.target.value);
  }

  const onOKSetLabelModal = () => {
    setIsSetLabelOpen(false);
  }

  const onCancelSetLabelModal = () => {
    setLabelHeader("");
    setLabelSubHeader("");
    setLabelCategory("");
    setLabelSubCategory("");
    setIsSetLabelOpen(false);
  }

  {/*==========================List and Viewer Component Size Setting====================================*/}

  const drawAnnotations = async () => {
    const fileReader = new FileReader();
    let uint8Array = new Uint8Array();
    
    fileReader.onload = () => {
      const arrayBuffer = fileReader.result;
      uint8Array = new Uint8Array(arrayBuffer);

      renderPdf(uint8Array);
    }
    setIsSetScaleModalOpen(true);
    fileReader.readAsArrayBuffer(file);
  };
  

  {/*=======================File Upload==================================*/}

  const handleDragOver = (event) => {
    event.preventDefault();
  }

  const handleDrop = (e) => {
    e.preventDefault();
    const seletedfile = e.dataTransfer.files[0];
    setFile(seletedfile);
    setPageNumber(1);
  }

  const onFileChange = (e) => {
    const selectedfile = e.target.files[0]
    setFile(selectedfile);
    setPageNumber(1);
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const renderPdf = async (data) => {
    const pdfjs = await import("pdfjs-dist/build/pdf");

    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

    const loadingTask = pdfjs.getDocument(data);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(pageNumber);

    const scale = 1;
    const viewport = page.getViewport({ scale });

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    setcanvasWidth(canvas.width);

    const annotationLayer = annotationLayerRef.current;
    annotationLayer.width = viewport.width;
    annotationLayer.height = viewport.height;

    const renderContext = {
      canvasContext: context,
      viewport,
    };

    await page.render(renderContext).promise;
  }; 

{/*===================Toolbar Setting==================================*/}

  const settingDrawType = (type) => {
    switch(type) {
      case "cursor":
        break;
      case "rect":
        setIsSetLabelOpen(true);
        break;
      case "poly":
        setIsSetLabelOpen(true);
        break;
      case "line":
        setIsSetLabelOpen(true);
        break;
      case "deduct":
        setIsSetLabelOpen(true);
        break;
      case "dot":
        setIsSetLabelOpen(true);
        break;
      case "undo":
        break;
      default:
        break;
    }
    setDrawType(type);
  }

{/*==================Drawing Annotation layer.========================*/}
{/*====Mouse Event Handler===== */}

const handleMouseClick = (e) => {
  if (clickTimer === null) {
    setClickTimer(setTimeout(() => {
      handleSingleClick(e);
      setClickTimer(null);
    }, 300));
  } else {
    clearTimeout(clickTimer);
    setClickTimer(null);
    handleDoubleClick(e);
  }
};

const handleMouseWheel = (e) => {
  if(e.deltaY < 0) {
    setZoomScale(zoomScale + 0.2);
  } else {
    setZoomScale(zoomScale - 0.2);
  }
}

const handleSingleClick = (e) => {
  const drawcanvas = annotationLayerRef.current;
  const context = drawcanvas.getContext('2d');

  setStartPoint(getMouseClickPosition(drawcanvas, e));
  setPreviousLegth(displayValue);
  setIsDrawing(true);
  if(drawType === "line") { 
    setPolyLineTracker([
      ...polyLineTracker,
      getMouseClickPosition(drawcanvas, e)
    ]);
  }
  if(drawType === "poly") {
    setPolyTracker([
      ...polyTracker,
      getMouseClickPosition(drawcanvas, e)
    ]);
  }
  if(drawType === "dot"){
    setIsDrawing(false);
    redraw();
    context.fillStyle = 'rgba(255, 0, 0, 0.7)';

    context.arc(getMouseClickPosition(drawcanvas,e).x, getMouseClickPosition(drawcanvas, e).y, 15, 0, 2 * Math.PI);
    context.fill();
    setDotNum(dotNum + 1);

    prevs.push({type: "dot", x: getMouseClickPosition(drawcanvas, e).x, y: getMouseClickPosition(drawcanvas, e).y});
    setPrevState([
      ...prevState,
      {type: "dot", x: getMouseClickPosition(drawcanvas, e).x, y: getMouseClickPosition(drawcanvas, e).y}
    ])
    
  }
};

const handleDoubleClick = (e) => {
  setIsDrawing(false);
  setIsDisplayValue(false);
  
  const canvas = annotationLayerRef.current;
  const context = canvas.getContext("2d");

  context.strokeStyle = 'red';
  context.lineWidth = "4";
  context.fillStyle = "rgba(255, 0, 0, 0.7)";

  let {x, y} = getMouseClickPosition(canvas, e);

  switch(drawType) {
    case "line":
      redraw();

      context.beginPath();
      context.moveTo(polyLineTracker[0].x, polyLineTracker[0].y);
      for(var i = 1; i < polyLineTracker.length; i++) {
        context.lineTo(polyLineTracker[i].x, polyLineTracker[i].y);
        context.stroke();
      }
      context.lineTo(x, y);
      context.stroke();
      
      prevs.push({type: "line", polyline: [...polyLineTracker, {x, y}]});
      setPrevState([
        ...prevState,
        {type: "line", polyline: [...polyLineTracker, {x, y}]}
      ])

      let Linedata = props.data.filter(item => item.name === labelcategory)[0].subcategory;
      Linedata = JSON.parse(Linedata);

      let lineprice = [];

      for(var i = 0; i < labelsubcategory.length; i++) {
        let maindata =  Linedata.filter(value => value.item === labelsubcategory[i])[0];
        lineprice.push((maindata.price * (1 + maindata.wastage / 100) * displayValue).toFixed(2))
      }

      setWidgetData([
        ...widgetData,
        {
          area: labelheader,
          subarea: labelsubheader,
          category: labelcategory,
          subcategory: labelsubcategory,
          type: "polyline",
          unit: props.data.filter(item => item.name === labelcategory)[0].unit,
          measure: displayValue.toFixed(2),
          result:displayValue.toFixed(2),
          price: lineprice,
        }
      ])
      setDisplayValue(0);
      setStartPoint({});
      setPolyLineTracker([]);
      context.closePath();
      break;
    case "rect":
      context.rect(startPoint.x, startPoint.y, x - startPoint.x, y - startPoint.y);
      context.fill();  
      
      prevs.push({type: "rect", x: startPoint.x, y: startPoint.y, width: x - startPoint.x, height: y - startPoint.y});
      setPrevState([
        ...prevState,
        {type: "rect", x: startPoint.x, y: startPoint.y, height: y - startPoint.y, width: x - startPoint.x}
      ])

      let RectData = props.data.filter(item => item.name === labelcategory)[0].subcategory;
      RectData = JSON.parse(RectData);

      let Rectprice = [];

      for(var i = 0; i < labelsubcategory.length; i++) {
        let maindata =  RectData.filter(value => value.item === labelsubcategory[i])[0];
        Rectprice.push((maindata.price * (1 + maindata.wastage / 100) * displayValue).toFixed(2))
      }

      setWidgetData([
        ...widgetData,
        {
          area: labelheader,
          subarea: labelsubheader,
          category: labelcategory,
          subcategory: labelsubcategory,
          type: "rect",
          unit: props.data.filter(item => item.name === labelcategory)[0].unit,
          measure: displayValue,
          result:displayValue,
          price: Rectprice
        }
      ])
      setStartPoint({});
      setDisplayValue(0);
      redraw();
      break;
    case "poly":

    context.beginPath();
      context.moveTo(polyTracker[0].x, polyTracker[0].y);
      for(var i = 1; i < polyTracker.length; i++) {
        context.lineTo(polyTracker[i].x, polyTracker[i].y);
        context.stroke();
      }
      context.lineTo(x, y);
      context.stroke();
      context.fill();

      polyTracker.push({x:x, y:y});

      prevs.push({type: "poly", track: polyTracker});

      let area = 0;

      for(i = 0; i < polyTracker.length; i++) {
        const {x: x1, y: y1} = polyTracker[i];
        const {x: x2, y: y2} = polyTracker[(i + 1) % polyTracker.length];

        area += (x1 * layoutSize / canvasWidth * pageScale / 1000) * (y2 * layoutSize / canvasWidth * pageScale / 1000) - (x2 * layoutSize / canvasWidth * pageScale / 1000) * (y1 * layoutSize / canvasWidth * pageScale / 1000);
      }

      area = Math.abs(area / 2).toFixed(2);

      let PolyData = props.data.filter(item => item.name === labelcategory)[0].subcategory;
      PolyData = JSON.parse(PolyData);

      let Polyprice = [];

      for(var i = 0; i < labelsubcategory.length; i++) {
        let maindata =  PolyData.filter(value => value.item === labelsubcategory[i])[0];
        Polyprice.push((maindata.price * (1 + maindata.wastage / 100) * displayValue).toFixed(2))
      }

      setWidgetData([
        ...widgetData,
        {
          area: labelheader,
          subarea: labelsubheader,
          category: labelcategory,
          subcategory: labelsubcategory,
          type: "polygon",
          unit: props.data.filter(item => item.name === labelcategory)[0].unit,
          measure: area,
          result:area,
          price: Polyprice
        }
      ])

      setPrevState([
        ...prevState,
        {type: "poly", track: polyTracker}
      ])

      setStartPoint({});
      setPolyTracker([]);
      setDisplayValue(0);
      context.closePath();
  }
};

const handleMouseMove = (e) => {
  if(isDrawing) {
    redraw();
    const drawcanvas = annotationLayerRef.current;
    var context = drawcanvas.getContext("2d");

    let {x, y} = getMouseClickPosition(drawcanvas, e);
    let diffX, diffY = 0;

    setMousePointX(e.clientX);
    setMousePointY(e.clientY);

    context.strokeStyle = 'red';
    context.lineWidth = "4";
    context.fillStyle = "rgba(255, 0, 0, 0.7)";

    context.beginPath();

    switch(drawType) {
      case "line":
        diffX = (Math.abs(startPoint.x - x) * layoutSize / canvasWidth) * pageScale;
        diffY = (Math.abs(startPoint.y - y) * layoutSize / canvasWidth) * pageScale;
        setDisplayValue(previouslength + (Math.ceil(Math.sqrt(diffX * diffX + diffY * diffY)) / 1000));

        setIsDisplayValue(true);
        
        context.moveTo(polyLineTracker[0].x, polyLineTracker[0].y);

          for(var i = 1; i < polyLineTracker.length; i++) {
            context.lineTo(polyLineTracker[i].x, polyLineTracker[i].y);
            context.stroke();
          }
          context.lineTo(x, y);
          context.stroke();
        break;
      case "rect":
        let drawrectwidth = (x - startPoint.x);
        let drawrectheight = (y - startPoint.y);
        diffX = (Math.abs(startPoint.x - x) * layoutSize / canvasWidth) * pageScale;
        diffY = (Math.abs(startPoint.y - y) * layoutSize / canvasWidth) * pageScale;
        setDisplayValue((diffX / 1000 * diffY / 1000).toFixed(2));

        setIsDisplayValue(true);
        context.rect(startPoint.x, startPoint.y, drawrectwidth, drawrectheight);
        context.stroke();        
        break;
      case "poly":
          
          context.moveTo(polyTracker[0].x, polyTracker[0].y);
          for(var i = 1; i < polyTracker.length; i++) {
            context.lineTo(polyTracker[i].x, polyTracker[i].y);
            context.stroke();
          }
          context.lineTo(x, y);
          context.stroke();
          diffX = (Math.abs(startPoint.x - x) * layoutSize / canvasWidth) * pageScale;
          diffY = (Math.abs(startPoint.y - y) * layoutSize / canvasWidth) * pageScale;

          polyTracker.push({x:x, y:y});

          let area = 0;

          for(i = 0; i < polyTracker.length; i++) {
            const {x: x1, y: y1} = polyTracker[i];
            const {x: x2, y: y2} = polyTracker[(i + 1) % polyTracker.length];
    
            area += (x1 * layoutSize / canvasWidth * pageScale / 1000) * (y2 * layoutSize / canvasWidth * pageScale / 1000) - (x2 * layoutSize / canvasWidth * pageScale / 1000) * (y1 * layoutSize / canvasWidth * pageScale / 1000);
          }
    
          area = Math.abs(area / 2).toFixed(2);
          polyTracker.pop();

          setIsDisplayValue(true);
          setDisplayValue(area);
            break;
      default:
        break;
    }
  }
}

/* ==== Get Mouse Click Position ===== */
  
const getMouseClickPosition = (canvas, e) => {
  var rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * canvas.width / rect.width,
    y: (e.clientY - rect.top) * canvas.height / rect.height,
  }
}

const redraw = () => {
  const canvas = annotationLayerRef.current;
  var context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  console.log('prevs = ', prevs);
  console.log('prevState = ', prevState);
  prevs && (prevs.forEach(item => {
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

  prevState && prevState.map(item => {
    context.beginPath();
    if(item.type === "line") {
      var polydots = item.polyline;
      context.moveTo(polydots[0].x, polydots[0].y);
      for(var i = 1; i < polydots.length; i++) {
        context.lineTo(polydots[i].x, polydots[i].y);
      }

      context.strokeStyle = 'red';
      context.lineWidth = "4";
      context.stroke();
    } else if (item.type === "rect") {
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
      context.fillstyle = 'rgba(255, 0, 0, 0.7)';
      context.arc(item.x, item.y, 15, 0, 2 * Math.PI);
      context.fill();
    }
  })
}

  return (
    <div className="container-fluid">
      {
        !file ?
        <div 
          id="upload_container"
        >
          <label htmlFor="file-upload" className="custom-file-upload">
            <div 
              id="upload_file"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
                  <PlusOutlined style={{margin:"auto"}} /> 
                  <p style={{textAlign:"center"}}>Click here or Drag & Drop</p>
                  <h6 style={{textAlign:"center"}}>You can upload files from computer</h6>
            </div>
            <input type='file' onChange={onFileChange} id = "file-upload"  style={{display:"none"}} accept=".pdf"/>
          </label>
        </div>
        : ""
      }
        
      {
        file && (
          <div>
            <FloatButton
              icon={<ZoomInOutlined />}
              type="primary"
              style={{
                right: "45%",
              }}
              onClick={() => (setZoomScale(zoomScale + 0.2))}
              tooltip="Zoom In"
            />
            <FloatButton
              icon={<ZoomOutOutlined />}
              type="primary"
              style={{
                right: "55%",
              }}
              onClick={() => (setZoomScale(zoomScale - 0.2))}
              tooltip="Zoom Out"
            />

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
                    <Scale onClick={() => setIsChangeScaleModalOpen(true)} pageScale ={pageScale} pageSize = {pageSize}/>
                  </Document>
                </div>
              </div>
              <div className="col-md-10 page">

              <DraggableToolbar onClick={settingDrawType} />
              <DraggableWidget widgetData={widgetData}  />
              {
                isDisplayValue ? <h3 style={{
                  position: "absolute",
                  top: `${mousePointY + 30}px`,
                  left: `${mousePointX + 30}px`,
                  zIndex: "1000",
                }}>
                  {displayValue}
                </h3> : ""
              }
                
                <div className="pageviewer">
                  <canvas 
                    id="pdf-canvas"
                    ref={canvasRef} 
                    style={{transform: `scale(${zoomScale})`, transformOrigin: "top left"}}
                  />
                  <canvas 
                      id="annotation-canvas" 
                      ref={annotationLayerRef}
                      onMouseMove={handleMouseMove}
                      onClick={handleMouseClick}
                      onWheel={handleMouseWheel}
                      style={{ position: 'absolute', left: 0, top: 0, transform: `scale(${zoomScale})`, transformOrigin: "top left"}}
                  />
                </div>  
              </div>
            </div>
          </div>
        )
      }

      
      {/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */}
      {/* Modal for Set Scale Page */}

      <Modal 
        title = "Find Page Scale"
        open= {isSetScaleModalOpen}
        onOk = {onOkSetScaleModal}
        onCancel={onCloseSetScaleModal}  
      >
        <h6 className = "text-center">
          Please Input the size and scale of paper
        </h6>
        <div className="dropdown row pagescale">
          <label className="col-md-4" for="setpagescale">Page Scale</label>
          <select className="col-md-8" id="setpavescale" value={selectScaleValue} onChange={onhandleSetPageScaleSelect}>
            <option value="100">1:100</option>
            <option value="50">1:50</option>
            <option value="25">1:25</option>
          </select>
        </div>
        <br />
        <div className="dropdown row pagesize">
          <label className="col-md-4" for="setpagesize">Page Size</label>
          <select className="col-md-8" id="setpagesize" value={selectSizeValue} onChange={onhandleSetPageSizeSelect}>
            <option value="A0">A0</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="A3">A3</option>
            <option value="A4">A4</option>
            <option value="A5">A5</option>
            <option value="A6">A6</option>
          </select>
        </div>  
      </Modal>

      {/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */}
      { /* Modal For Change Scale */}
      <Modal 
        title = "Change Page Scale"
        open= {isChangeScaleModalOpen}
        onOk = {onOkChangeScaleModal}
        onCancel={onCloseChangeScaleModal}  
      >
        <h6 className = "text-center">
          Please Input the size and scale of paper
        </h6>
        <div className="dropdown row pagescale">
          <label className="col-md-4" for="setpagescale">Page Scale</label>
          <select className="col-md-8" id="setpavescale" value={selectScaleValue} onChange={onhandleSetPageScaleSelect}>
            <option value="100">1:100</option>
            <option value="50">1:50</option>
            <option value="25">1:25</option>
          </select>
        </div> 
      </Modal>
        
      {/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */}
      {/* Modal for Set Label */}
      <Modal 
        title = "Set Label"
        open = {isSetLabelOpen}
        onOk = {onOKSetLabelModal}
        onCancel={onCancelSetLabelModal}
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
          <label className="col-md-4" htmlFor="category">Category</label>
          <select className="col-md-8" id="category" value={labelcategory} onChange={handleCategorySelect}>
            <option value="" disabled>Select an option</option>
            {
              categorySelectList && categorySelectList.map((item) => {
                return <option value={item}>{item}</option>;
              })
            }
          </select>
        </div>

        <div className="dropdown row subcategory">
          <label className="col-md-4" for="sub-category">Sub-Category</label>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Please select"
            onChange={handleSubCategorySelect}
          >
            {/* Render the options */}
            {subCategorySelectList.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
      </Modal>
    </div>
  );
};

const mapStateToProps = (state) => ({
  data: state.admin.data
})

export default connect(mapStateToProps,{retrieveData})(App);