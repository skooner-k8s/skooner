import React, { Component, Fragment, ReactNode } from "react";
import Menu from "./components/menu";
import { Notifier } from "./components/notifier";
import Error from "./components/error";
import { initRouter } from "./router";
import log from "./utils/log";
import Button from "./components/button";
import LogoSvg from "./art/k8dashSvg";
import HamburgerSvg from "./art/hamburgerSvg";

type State = {
  content?: ReactNode;
  contentDate?: number;
  hasError?: boolean;
  menuToggled?: boolean;
};

const genericError = (
  <div id="content">
    <Error
      messages={[
        "There was an error and this content was unable to be displayed.",
      ]}
    />
  </div>
);

class App extends Component<{}, State> {
  componentDidMount() {
    initRouter((content: ReactNode) => {
      this.setState({ content, contentDate: Date.now(), hasError: false });
      window.scrollTo(0, 0);
    });
    this.detectColorScheme();
  }

  detectColorScheme = () => {
    let theme = "light"; //default to light

    //local storage is used to override OS theme settings
    if (localStorage.useDarkMode) {
      if (localStorage.useDarkMode === "true") {
        theme = "dark";
      }
    } else if (!window.matchMedia) {
      //matchMedia method not supported
      return false;
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      //OS theme setting detected as dark
      theme = "dark";
      localStorage.useDarkMode = "true";
    }

    //dark theme preferred, set document with a `data-theme` attribute
    if (theme === "dark") {
      const root = document.body;
      if (!root) return;

      if (localStorage.useDarkMode) {
        root.classList.add("dark-mode");
      } else {
        root.classList.remove("dark-mode");
      }
    }
  };

  componentDidCatch(err: Error, info: any) {
    // eslint-disable-line class-methods-use-this
    log.error("Error rendering ", { err, info });
    this.setState({ hasError: true });
  }

  render() {
    const { content, contentDate, hasError, menuToggled } = this.state || {};

    return (
      <>
        <div id="titleBar">
          <Button
            className="button_clear titleBar_hamburger"
            onClick={() => this.setState({ menuToggled: !menuToggled })}
          >
            <HamburgerSvg className="svg_button" />
          </Button>

          <a href="#!">
            <LogoSvg className="titleBar_logo" />
          </a>
        </div>

        <div id="shell">
          <Menu
            toggled={menuToggled}
            onClick={() => this.setState({ menuToggled: false })}
          />

          <Fragment key={contentDate}>
            {hasError ? genericError : content}
          </Fragment>
        </div>

        <Notifier />
      </>
    );
  }
}

export default App;
