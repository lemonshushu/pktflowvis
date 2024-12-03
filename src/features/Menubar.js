import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Tab, TabList, makeStyles } from "@fluentui/react-components";
import { Home32Regular, TextBulletListSquare32Regular, ChatWarning24Regular, PersonCircle32Regular, Settings32Regular, Key32Regular, ShieldKeyhole24Regular, PersonAdd28Regular, DataUsageEdit24Regular } from '@fluentui/react-icons'
import { useDispatch } from "react-redux";

/*
const iconStyle: React.CSSProperties = {
  marginRight: '8px',
  fontSize: '25px',
};
*/

function CurLocation(path) {
  console.log(path);
  if(path=="/graph") {
    return "toptab1";
  }
  else if(path=="/timeline") {
    return "toptab2";
  }
  else if(path=="/integrated") {
    return "toptab3";
  }
  return "toptab1";
}
  
  //create top-bar
export function Top(props) {
    //defaultSelectedValue={CurLocation(useLocation().pathname)}
    return (
        <div className="top-bar" style={{display: "inline"}}>
            <h1>
                PktFlowVis
            </h1>
            <TabList defaultSelectedValue={CurLocation(useLocation().pathname)} size="large">
                <Tab value="toptab1" icon={<Key32Regular/>} onclick={props.onNavigateToGraph}>Graph View</Tab>
                <Tab value="toptab2" icon={<PersonAdd28Regular/>} onClick={props.onNavigateToTimeline}>Timeline View</Tab>
                <Tab value="toptab3" icon={<Home32Regular/>}>Integrated View</Tab>
            </TabList>
        </div>
    );
}

  export function Content() {
    return (
      <main className="content">
        Welcome to Ploio
        
      </main>
    );
  }