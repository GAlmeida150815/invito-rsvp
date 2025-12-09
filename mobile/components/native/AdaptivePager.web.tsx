// mobile/components/native/AdaptivePager.web.tsx
import React from "react";
import { View } from "react-native";

// Um componente "oco" que não faz nada, apenas impede o erro de importação
const AdaptivePager = React.forwardRef((props: any, ref: any) => {
  return <View>{props.children}</View>;
});

AdaptivePager.displayName = "AdaptivePager";

export default AdaptivePager;
