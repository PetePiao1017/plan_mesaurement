import { useState, useEffect, useRef } from "react";
import { PlusOutlined } from '@ant-design/icons';
import { Document, Page, pdfjs } from "react-pdf/dist/esm/entry.webpack";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./Main.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;


const Test = () => {

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


  const onFileChange = (e) => {
    console.log(e.target.files[0])
    const selectedfile = e.target.files[0]
    setFile(selectedfile);
    setPageNumber(1);
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  /*==========================List and Viewer Component Size Setting====================================*/

  useEffect(() => {
    console.log(file)
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
      
      const annotationCanvas = annotationLayerRef.current;
      const annotationContext = annotationCanvas.getContext('2d');

      // Clear the annotation layer canvas
      annotationContext.clearRect(0, 0, annotationCanvas.width, annotationCanvas.height);

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


  /*============================ Drawing according to Mouse Action ==============================================*/

    let start = {}
    let rects = []

    function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect()
    return {
        x: (evt.clientX - rect.left) * canvas.width / rect.width,
        y: (evt.clientY - rect.top) * canvas.height / rect.height,
    };
    }

    function draw() {
    var canvas = annotationLayerRef.current
    var context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height)
    rects.forEach(rect => {
        context.beginPath();
        context.rect(rect.x, rect.y, rect.width, rect.height);
        context.strokeStyle = 'blue';
        context.stroke();
    }); 
    }

  const mouseDownDraw = (e) => {
    var canvas = annotationLayerRef.current
    start = getMousePos(canvas, e);
  }

  const mouseMoveDraw = (e) => {
    var canvas = annotationLayerRef.current
    var context = canvas.getContext('2d')
    if (start.x) {
        draw()
        let { x, y } = getMousePos(canvas, e)
        context.beginPath();
        context.rect(start.x, start.y, x - start.x, y - start.y);
        context.strokeStyle = 'red';
        context.stroke();
        context.beginPath();
        context.arc(start.x, start.y, 5, 0, 2 * Math.PI);
        context.fill();
        context.beginPath();
        context.arc(x, y, 5, 0, 2 * Math.PI);
        context.fill();
      }
  }

  const mouseMoveUp = (e) => {
    var canvas = annotationLayerRef.current
    let { x, y } = getMousePos(canvas, e)
    rects.push({x: start.x, y: start.y, width: x - start.x, height: y - start.y})
    start = {}
    draw()
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
                </Document>
              </div>
            </div>
            <div className="col-md-10 page"  ref={viewRef}>
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
    </div>
  );
};

export default Test;