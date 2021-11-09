import React from "react";
import { notification } from "antd";
// import Link from '../components/Link';

export function notify({
  message = "",
  description = undefined as any,
  txid = "",
  type = "info",
  placement = "bottomLeft",
}) {
  if (txid) {
    description = <></>;
  }
  (notification as any)[type]({
    message: <span style={{ color: "black" }}>{message}</span>,
    description: (
      <span style={{ color: "black", opacity: 0.5 }}>{description}</span>
    ),
    placement,
    style: {
      backgroundColor: "white",
    },
  });
}
