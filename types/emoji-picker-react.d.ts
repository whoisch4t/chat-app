declare module "emoji-picker-react" {
    export interface EmojiClickData {
        emoji: string;
        names: string[];
        unified: string;
        originalUnified: string;
        getImageUrl: () => string;
    }

    export enum Theme {
        DARK = "dark",
        LIGHT = "light",
        AUTO = "auto",
    }

    interface PickerProps {
        onEmojiClick: (emoji: EmojiClickData) => void;
        theme?: Theme;
    }

    const EmojiPicker: React.FC<PickerProps>;
    export default EmojiPicker;
}
