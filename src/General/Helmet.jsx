import React, { useEffect } from "react";

export default function Helmet(props) {
  useEffect(() => {
    document.title = props.title;
  }, [props.title]);

  return <div className="w-100">{props.children}</div>;
};