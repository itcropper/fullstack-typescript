import React, { Component } from 'react';
import { FormGroup, InputGroup, FileInput, TextArea, Button, Checkbox } from "@blueprintjs/core";
import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import axios from 'axios';
import "../styles/import.css";

class Import extends Component {

    public state: {
        fileValue: string,
        filePlaceholder: string,
        withGeo: boolean
    }

    constructor(props){
        super(props);
        this.state = {
            filePlaceholder: "Choose file...",
            fileValue: null,
            withGeo: false
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onFileSelected = this.onFileSelected.bind(this);
        this.includeGeo = this.includeGeo.bind(this);
    }

    includeGeo(e) {
        this.setState({
            withGeo: e.target.checked
        })
    }

    handleSubmit(e) {
        e.preventDefault();

        const url = "/api/table/post",
              formData = new FormData(),
              config = {
                  headers: {
                    'content-type': 'multipart/form-data'
                }
            };

        formData.append("name", e.target.elements.name.value);
        formData.append('baseLocation', e.target.elements.baseLocation.value);
        formData.append('locationColumn', e.target.elements.locationColumn.value);
        formData.append("description", e.target.elements.description.value);
        formData.append('file',this.state.fileValue);

        return  axios.post(url, formData,config)
    }

    onFileSelected(e){
        this.setState({
            filePlaceholder: e.target.files[0].name,
            fileValue: e.target.files[0]
        })
    }

    render() {

        let geoFields = (
            <div>
                <FormGroup helperText="" label="Location Column" labelFor="location-column" labelInfo="(required)">
                    <InputGroup id="location-column" name="locationColumn" placeholder="Location Column"/>
                </FormGroup>
                <FormGroup helperText="" label="Base Location (State, Country...)" labelFor="base-location" labelInfo="">
                    <InputGroup id="location-column" name="baseLocation" placeholder="Base"/>
                </FormGroup>
            </div>
        )

        return (
            <div className="data-imports clearfix"  >
                <form onSubmit={this.handleSubmit}>
                    <FormGroup  helperText="" label="Data File" labelFor="file-input"  labelInfo="(required)">
                        <FileInput  id="file-input" text={this.state.filePlaceholder}  onInputChange={this.onFileSelected}  />
                    </FormGroup>

                    <FormGroup  helperText="" label="Data Name" labelFor="data-name"  labelInfo="(required)">
                        <InputGroup id="data-name" placeholder="Name" name="name" />
                    </FormGroup>
                    <FormGroup  helperText="" label="Description" labelFor="data-description" labelInfo="(required)">
                        <TextArea id="data-description" name="description" placeholder="Description..." />
                    </FormGroup>
                    <FormGroup>
                        <Checkbox checked={this.state.withGeo} label="Include Geo Column" onChange={this.includeGeo} />
                    </FormGroup>
                    {
                        this.state.withGeo ? 
                        geoFields: 
                        null
                    }
                    <Button
                        intent="primary"
                        type="submit"
                        style={{float:"right"}}
                        >
                    Submit</Button>
                </form>
            </div>
        );
    }
}


export default Import;
