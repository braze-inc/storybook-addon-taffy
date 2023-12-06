import React, { useRef, useState, useLayoutEffect } from 'react';
import { addons } from '@storybook/manager-api';
import { Resizable } from 're-resizable';
import constants from './constants';

const {
  minWrapperWidth,
  resizeHandleWidth,
  wrapperWidthChangeEvent,
  wrapperMaxWidthChangeEvent,
  toolWidthChangeEvent
} = constants;

const TaffyWrapper = ({ defaultWidth = "100%", children }) => {

  let isMounted = false;
  const channel = addons.getChannel();
  const wrapperEl = useRef(null);
  const [wrapperWidth, setWrapperWidth] = useState(defaultWidth);
  useLayoutEffect(() => {
    isMounted = true;
    if (wrapperEl && wrapperEl.current) {
      const maxWidth = wrapperEl.current.getBoundingClientRect().width;
      channel.emit(wrapperMaxWidthChangeEvent, maxWidth);
      setWrapperWidth(maxWidth);
    }
    channel.on(toolWidthChangeEvent, handleToolWidthChange);
    channel.emit(wrapperWidthChangeEvent, wrapperWidth);

    return () => {
      channel.off(toolWidthChangeEvent);
      isMounted = false;
    }
  }, [wrapperEl.current]);

  const handleResize = width => {
    channel.emit(wrapperWidthChangeEvent, width);
  };

  const handleResizeStop = width => {
    if (width < minWrapperWidth) {
      width = minWrapperWidth;
    }
    channel.emit(wrapperWidthChangeEvent, width);
    setWrapperWidth(width);
  };

  const handleToolWidthChange = width => {
    if (isMounted) {
      setWrapperWidth(parseInt(width));
    }
  };

  return (
    <div style={{
      paddingRight: resizeHandleWidth
    }}>
      <Resizable
        onResize={(e, direction, ref, d) => handleResize(wrapperWidth + d.width)}
        onResizeStop={(e, direction, ref, d) => handleResizeStop(wrapperWidth + d.width)}
        size={{ width: wrapperWidth, height: '100%' }}
        style={{
          backgroundColor: '#fff',
          position: 'relative',
          left: '50%',
          height: '100%',
          transform: 'translateX(-50%)'
        }}
        handleStyles={{
          right: {
            backgroundColor: '#ccc',
            display: 'block',
            height: '100%',
            position: 'absolute',
            right: `-${resizeHandleWidth}`,
            top: 0,
            width: resizeHandleWidth
          }
        }}
        enable={{
          top: false,
          right: true,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false
        }}
      >
        <div ref={wrapperEl}>
          {children}
        </div>
      </Resizable>
    </div>
  );
};

export const withTaffy = (Story) => (
  <TaffyWrapper>
    <Story />
  </TaffyWrapper>
);

export const withTaffyDefault = (defaultWidth) => (Story) => (
  <TaffyWrapper defaultWidth={defaultWidth}>
    <Story />
  </TaffyWrapper>
);