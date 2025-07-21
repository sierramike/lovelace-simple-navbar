/* eslint-disable @typescript-eslint/no-explicit-any */
import {css, CSSResult, html, LitElement, PropertyValues, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators';
import {DateTime} from 'luxon';
import {HomeAssistant, fireEvent} from 'custom-card-helpers';

import {CARD_VERSION} from './const';
import ISimpleNavbarConfig from './ISimpleNavbarConfig';
import ISimpleNavbarItem from './ISimpleNavbarConfig';

/* eslint no-console: 0 */
console.info(
    `%c  Simple Navbar \n%c  Version ${CARD_VERSION}    `,
    'color: orange; font-weight: bold; background: black',
    'color: white; font-weight: bold; background: dimgray',
);

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
    type: 'simple-navbar',
    name: 'SimpleNavbar',
    description: 'A simple navigation bar for Home Assistant',
});

@customElement('simple-navbar')
export class SimpleNavbar extends LitElement {
    @property({attribute: false}) public hass!: HomeAssistant;
    @state() private _sDate = '';
    @state() private _sTime = '';
    @state() private _config?: ISimpleNavbarConfig;
    @state() private _interval = 1000;
    private _intervalId?: number;

    public setConfig(config: ISimpleNavbarConfig): void {
        this._config = { ...config, firstLineLayout: { ...config.firstLineLayout }, secondLineLayout: { ...config.secondLineLayout } };

        if (this._config.size == "" || this._config.size === undefined)
            this._config.size = "32px";

        if (this._config.fontSize == "" || this._config.fontSize === undefined)
            this._config.fontSize = "20px";

        if (this._config.background == "" || this._config.background === undefined)
            this._config.background = "var(--primary-background-color, white)";

        if (this._config.timeFormat == "" || this._config.timeFormat === undefined)
            this._config.timeFormat = "HH:mm:ss";

        if (this._config.dateFormat == "" || this._config.timedateFormatFormat === undefined)
            this._config.dateFormat = "cccc d LLLL yyyy";

        if (this._config.interval !== this._interval)
            this._interval = this._config.interval ?? 1000;
    }

    protected shouldUpdate(changedProps: PropertyValues): boolean {
        return changedProps.has('_sDate') || changedProps.has('_sTime') || changedProps.has('_config') || changedProps.has('hass');
    }

    public async getCardSize(): Promise<number> {
        return 3;
    }

    protected updated(changedProperties: PropertyValues): void {
        super.updated(changedProperties);

        if (changedProperties.has('_interval')) {
            this._stopInterval();
            this._startInterval();
        }
        if (changedProperties.has('_config'))
            this._updateDateTime();
    }

    public connectedCallback(): void {
        super.connectedCallback();
        this._startInterval();
    }

    private _startInterval(): void {
        if (this._intervalId)
            return;

        this._intervalId = window.setInterval(this._updateDateTime.bind(this), this._interval);
    }

    private _stopInterval(): void {
        if (!this._intervalId)
            return;
        window.clearInterval(this._intervalId);
        this._intervalId = undefined;
    }

    private async _updateDateTime(): Promise<void> {
        const timeZone = this._config?.timeZone ?? this.hass?.config?.time_zone;
        const locale = this._config?.locale ?? this.hass?.locale?.language;

        let dateTime: DateTime = DateTime.local();

        if (timeZone)
            dateTime = dateTime.setZone(timeZone);
        if (locale)
            dateTime = dateTime.setLocale(locale);

        let sDate: string;
        let sTime: string;

        if (typeof this._config?.dateFormat === 'string')
            if (this._config.dateFormat.toLowerCase().trim() == "none")
                sDate = "";
            else
                sDate = dateTime.toFormat(this._config.dateFormat);
        else
            sDate = "Wrong date format";

        if (typeof this._config?.timeFormat === 'string')
            if (this._config.timeFormat.toLowerCase().trim() == "none")
                sTime = "";
            else
                sTime = dateTime.toFormat(this._config.timeFormat);
        else
            sTime = "Wrong time format";

        if (sDate !== this._sDate)
            this._sDate = sDate;
        if (sTime !== this._sTime)
            this._sTime = sTime;
    }

    public disconnectedCallback(): void {
        this._stopInterval();
        super.disconnectedCallback();
    }

    protected _executeAction(item: ISimpleNavbarItem): void {
        if (item.action == undefined)
            return;

        try {
          switch (item.action) {
            case 'navigate':
              this._executeActionNavigate(item);
              break;
            case 'url':
              this._executeActionUrl(item);
              break;
            case 'toggle':
              this._executeActionToggle(item);
              break;
            case 'call-service':
              this._executeActionService(item);
              break;
            case 'more-info':
              this._executeActionMoreInfo(item);
              break;
            default:
              console.warn("SimpleNavbar: Unrecognized action:", item.action);
          }
        } catch (e) {
          console.error("SimpleNavbar: Error executing action:", item.action, e);
        }
    }

    protected _executeActionNavigate(item: ISimpleNavbarItem): void {
        if (item.navigation_path) {
            window.history.pushState(null, "", item.navigation_path);
            fireEvent(window, 'location-changed');
        } else {
            console.warn(`SimpleNavbar: No navigation path defined for item ${item.name}`, item);
        }
    }

    protected _executeActionUrl(item: ISimpleNavbarItem): void {
        if (item.url_path) {
          window.open(item.url_path, item.url_target || '_blank');
        } else {
          console.warn(`SimpleNavbar: URL action called without url_path for item ${item.name}`, item);
        }
    }

    protected _executeActionToggle(item: ISimpleNavbarItem): void {
        if (item.entity) {
          this.hass.callService('homeassistant', 'toggle', { entity_id: item.entity });
        } else {
          console.warn(`SimpleNavbar: Toggle action called without a valid entity_id for item ${item.name}`, item);
        }
    }

    protected _executeActionService(item: ISimpleNavbarItem): void {
        if (!item.service) {
          console.warn(`SimpleNavbar: Call-service action called without service defined for item ${item.name}`, item);
          return;
        }
        const [domain, service] = item.service.split('.', 2);
        if (!domain || !service) {
          console.warn("SimpleNavbar: Invalid service format:", item.service);
          return;
        }

        // Use service_data or data for compatibility
        const serviceData = item.service_data || item.data || {};

        // Target handling
        const target = item.target || (serviceData.entity_id ? { entity_id: serviceData.entity_id } : {});

        this.hass.callService(domain, service, serviceData, target);
    }

    protected _executeActionMoreInfo(item: ISimpleNavbarItem): void {
        const entityId = item.entity;

        if (item.entity) {
          fireEvent(this, 'hass-more-info', { entityId });
        } else {
          console.warn(`SimpleNavbar: More-info action called without a valid entity_id for item ${item.name}`, item);
        }
    }

    protected parseText(text: string): string {
        return text.replace(/\{\{\s*(.*?)\s*\}\}/g, (_match, entityId) => {
            if (entityId.toLowerCase().trim() === "user")
                return this.hass.user.name || "Utilisateur inconnu";
            else if (entityId.toLowerCase().trim() === "date")
                return this._sDate;
            else if (entityId.toLowerCase().trim() === "time")
                return this._sTime;
            else {
                const entity = this.hass.states[entityId];
                if (!entity) return '[Entité non trouvée]';
                return entity.state;
            }
        });
    }

    protected render(): TemplateResult | void {
        let items = html``;

        if (this._config?.items) {
            this._config.items.forEach((item) => {
                const text = this.parseText(item.text || "");
                const secondLine = this.parseText(item.secondLine || "2nd line");
                const icon = this.parseText(item.icon || "mdi:home-assistant");
                const iconTextSpacing = this.parseText(item.iconTextSpacing || "20px");

                const style = this.parseText(`${item.pushToRight ? "margin-left:auto;" : ""} ${item.horizontalPadding == undefined ? "" : `padding-left:${item.horizontalPadding};padding-right:${item.horizontalPadding};`} color:${item.color || "grey"}; ${item.fontSize == undefined ? "" : `font-size:${item.fontSize};`} ${item.fontWeight == undefined ? "" : `font-weight:${item.fontWeight};`} ${item.textAlign == undefined ? "" : `text-align:${item.textAlign};`} cursor:${item.action == undefined ? "default" : "cursor"}; ${item.additionalCSS};`);

                switch (item.type) {
                    case "label":
                        if (text.trim() != "") {
                            const haicon = html`<ha-icon icon="${icon}"></ha-icon>`;
                            items = html`${items}
                                <div class="menu-item"
                                    style="${style}" @click=${() => this._executeAction(item)}>
                                        ${icon?.trim() != "" ? haicon : ""}<div style="${icon?.trim() != "" ? `padding-left:${iconTextSpacing};` : ""}">${text}</div>
                                </div>
                            `;
                        }
                        break;
                    case "label-2lines":
                        if (text.trim() != "" || secondLine.trim() != "") {
                            items = html`${items}
                                <div class="menu-item label2lines ${item.selected ? "selected" : ""} ${item.action == undefined ? "" : "hoverable"}"
                                    style="${style}" @click=${() => this._executeAction(item)}>
                                        <div>${text}</div><div>${secondLine}</div>
                                </div>
                            `;
                        }
                        break;
                    case "icon-text":
                        if (text.trim() != "") {
                            items = html`${items}
                                <div class="menu-item ${item.selected ? "selected" : ""} ${item.action == undefined ? "" : "hoverable"}"
                                    style="${style}" @click=${() => this._executeAction(item)}>
                                        <ha-icon icon="${icon}"></ha-icon><div style="padding-left:${iconTextSpacing};">${text}</div>
                                </div>
                            `;
                        }
                        break;
                    case "icon":
                        items = html`${items}
                            <div class="menu-item ${item.selected ? "selected" : ""} ${item.action == undefined ? "" : "hoverable"}"
                                style="${style}" @click=${() => this._executeAction(item)}>
                                    <ha-icon icon="${icon}"></ha-icon>
                            </div>
                        `;
                        break;
                    default: // "text"
                        if (text.trim() != "") {
                            items = html`${items}
                                <div class="menu-item ${item.selected ? "selected" : ""} ${item.action == undefined ? "" : "hoverable"}"
                                    style="${style}" @click=${() => this._executeAction(item)}>
                                        <div>${text}</div>
                                </div>
                            `;
                        }
                        break;
                }
            });
        }

        return html`
            <ha-card style="--mdc-icon-size:${this._config?.size};">
                <div class="spaceholder">SimpleNavbar</div>
                <div class="menu" style="background:${this._config?.background};font-size:${this._config?.fontSize}; ${this._config?.fontWeight == undefined ? "" : `font-weight:${this._config?.fontWeight};`} ${this._config?.additionalCSS};">
                    ${items}
                </div>
            </ha-card>
        `;
    }

    static get styles(): CSSResult {
        return css`
            ha-card {
            }

            .spaceholder {
                height: calc(var(--mdc-icon-size) + 10px);
            }

            .menu {
                position: fixed;
                z-index: 1000;
                display: flex;
                left: var(--mdc-drawer-width, 0px);
                width: calc(100% - var(--mdc-drawer-width, 100%));
                top: calc(var(--kiosk-header-height, var(--header-height)) + env(safe-area-inset-top));
                align-items: center;
            }

            .menu-item {
                padding: 10px 30px;
                height: var(--mdc-icon-size);
                border-bottom: 2px solid transparent;
                cursor: pointer;
                transition: all 0.2s ease-in-out;
                display: table;
            }

            .label2lines {
                padding-top: 0;
                display: grid;
            }

            .menu-item > div {
                display: table-cell;
                vertical-align: middle;
            }

            .hoverable:hover {
                background: #DDDDDD;
                border-bottom: 2px solid grey;
                color: black;
            }

            .selected {
                border-bottom: 2px solid var(--primary-color, #03a9f4);
                color: var(--primary-color, #03a9f4) !important;
            }

            .selected:hover {
                background: #DDDDDD;
                border-bottom: 2px solid var(--primary-color, #03a9f4);
                color: var(--primary-color, #03a9f4);
            }

            ha-card > span {
                display: block;
            }
        `;
    }

    static getStubConfig() {
        return {
            size: "32px",
            fontSize: "large",
            items: [{
                type: "icon",
                text: "Home",
                icon: "mdi:home",
                selected: true,
                action: "navigate",
                navigation_path: "/lovelace/0",
            }, {
                text: "Lights",
                action: "navigate",
                navigation_path: "/lovelace/lights",
            }, {
                text: "{{ time }}",
                type: "label",
                icon: "mdi:clock",
                color: "black",
                pushToRight: true,
                horizontalPadding: "10px",
            }, {
                text: "settingsIcon",
                type: "icon",
                icon: "mdi:cog",
                horizontalPadding: "10px",
            }],
        };
    }
}
