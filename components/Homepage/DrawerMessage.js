import React, { Component } from "react";
import { render } from "react-dom";

import Drawer from "@material-ui/core/Drawer";

class DrawerMessage extends Component {
  constructor() {
    super();
    this.state = {
      openDrawer: false,
    };
  }

  toggleDrawer() {
    this.setState({
      openDrawer: !this.state.openDrawer,
    });
  }

  render() {
    return (
      <div>
        <button onClick={this.toggleDrawer.bind(this)}> Toggle Drawer</button>
        <Drawer
          open={this.state.openDrawer}
          containerClassName="drawer-side-drawer"
          openSecondary={true}
          docked={true}
        >
          <div className="drawer-title-div">
            <h4 className="drawer-title-text">It's my drawer</h4>
          </div>
        </Drawer>
      </div>
    );
  }
}

export default DrawerMessage;
