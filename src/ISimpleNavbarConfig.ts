export default interface ISimpleNavbarServiceData {
    [key: string]: any; // Allow additional properties
}

export default interface ISimpleNavbarItem {
    selected?: boolean;
    type?: string;
    icon?: string;
    text?: string;
    secondLine?: string;
    iconTextSpacing?: string;
    pushToRight?: boolean;
    horizontalPadding?: string;
    color?: string;
    fontSize?: string;
    fontWeight?: string;
    textAlign?: string;
    action?: string;
    entity?: string;
    navigation_path?: string;
    url_path?: string;
    url_target?: string;
    service?: string;
    service_data?: ISimpleNavbarServiceData;
    additionalCSS?: string;
}

export default interface ISimpleNavbarConfig {
    interval?: number;
    timeFormat?: string;
    dateFormat?: string;
    timeZone?: string;
    locale?: string;
    selectedColor?: string;
    background?: string;
    additionalCSS?: string;
    size?: string;
    fontSize?: string;
    topSpacingOffset?: string;
    items?: ISimpleNavbarItem[];
}
