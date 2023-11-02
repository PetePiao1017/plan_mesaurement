import React from "react";
import { InboxOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import {  Upload} from 'antd';

const { Dragger } = Upload;


const Firstpage = () => {

    const navigate = useNavigate();

    const onChange = (info) =>{
        navigate(
            '/main', 
            {replace: true},
            {state:{file: info.file}}
            )
    }

    const onDrop = (e) => {
        console.log('Dropped files', e.dataTransfer.files)
    }
    return(
        <Dragger 
            onChange={onChange}
            onDrop={onDrop}
        >
            <p className="ant-upload-drag-icon">
                <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
                Support for a single or bulk upload. Strictly prohibited from uploading company data or other
                banned files.
            </p>
        </Dragger>
    )
    
    };
  
  export default Firstpage;