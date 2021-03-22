import CarrotSearchFoamTree from '@carrotsearch/foamtree';

class FoamTreeWrapper {
  constructor({ element, dataObject, onGroupHover, onGroupSecondaryClick }) {
    const wrapper = this;
    wrapper.foamTree = new CarrotSearchFoamTree({
      element,
      layout: 'squarified',
      stacking: 'flattened',
      pixelRatio: window.devicePixelRatio || 1,
      maxGroups: Infinity,
      maxGroupLevelsDrawn: Infinity,
      maxGroupLabelLevelsDrawn: Infinity,
      maxGroupLevelsAttached: Infinity,
      groupMinDiameter: 0,
      groupLabelVerticalPadding: 0.2,
      rolloutDuration: 0,
      pullbackDuration: 0,
      fadeDuration: 0,
      groupExposureZoomMargin: 0.2,
      zoomMouseWheelDuration: 300,
      openCloseDuration: 200,
      dataObject,
      titleBarDecorator(opts, props, vars) {
        vars.titleBarShown = false;
      },
      onGroupClick(event) {
        event.preventDefault();
        if ((event.ctrlKey || event.secondary) && onGroupSecondaryClick) {
          onGroupSecondaryClick.call(wrapper, event);
          return;
        }
        wrapper.zoomOutDisabled = false;
        this.zoom(event.group);
      },
      onGroupDoubleClick(event) {
        event.preventDefault();
      },
      onGroupHover(event) {
        if (onGroupHover) {
          onGroupHover.call(wrapper, event);
        }
      },
      onGroupMouseWheel(event) {
        const { scale } = this.get('viewport');
        const isZoomOut = event.delta < 0;

        if (isZoomOut) {
          if (wrapper.zoomOutDisabled) return event.preventDefault();
          if (scale < 1) {
            wrapper.zoomOutDisabled = true;
            event.preventDefault();
          }
        } else {
          wrapper.zoomOutDisabled = false;
        }
      },
    });
  }
}

export default (options) => {
  return new FoamTreeWrapper(options);
};
