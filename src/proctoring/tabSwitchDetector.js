export function detectTabSwitch(sendEvent){

  document.addEventListener("visibilitychange", () => {

    if (document.hidden) {

      sendEvent({
        type: "tab_switch"
      });

    }

  });

}