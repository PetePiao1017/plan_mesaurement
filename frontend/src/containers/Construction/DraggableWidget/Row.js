import { Select } from "antd";
import { useState } from "react";

const Row = (props) => {

    const { Option } = Select;


    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleSubCategorySelect = (value, option) => {
        setSelectedIndex(option.key);
      }

    return(
        <div className="widget-content" key={props.index}>
            <div className="col-md-1 text-center">
                {props.data.area}
            </div>
            <div className="col-md-1 text-center">
                {props.data.subarea}
            </div>
            <div className="col-md-1 text-center">
                {props.data.category}
            </div>
            <div className="col-md-2 dropdown row subcategory text-center">
                <Select
                onChange={handleSubCategorySelect}
                defaultValue={props.data.subcategory[0]}
                >
                {props.data.subcategory.map((option, index) => (
                    <Option key={index} value={option}>
                    {option}
                    </Option>
                ))}
                </Select>
            </div>
            <div className="col-md-1 text-center">
                {props.data.type}
            </div>
            <div className="col-md-1 text-center">
                {props.data.unit}
            </div>
            <div className="col-md-1 text-center">
                {props.data.measure}
            </div>
            <div className="col-md-1 text-center" style={{cursor: "pointer"}} onClick={() => props.onClick(props.index)}>
                HDP
            </div>
            <div className="col-md-1 text-center">
                {props.data.result}
            </div>
            <div className="col-md-2 text-center">
                {props.data.price[selectedIndex]}
            </div>
            </div>
    )
}

export default Row;