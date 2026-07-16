export type NavigatorClipboardProps = {
  text: string;
};

export type NavigatorShareProps = {
  title: string;
  text: string;
  link: string;
};

export type NavigatorClipboardResult = {
  success: boolean;
};

export type NavigatorShareResult = {
  success: boolean;
  method: "share" | "clipboard" | "unsupported";
};
