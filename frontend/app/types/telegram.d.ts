declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            is_bot: boolean;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
            added_to_attachment_menu?: boolean;
            allows_write_to_pm?: boolean;
            photo_url?: string;
          };
          chat?: {
            id: number;
            type: string;
            title?: string;
            username?: string;
            photo_url?: string;
          };
          chat_type?: string;
          chat_instance?: string;
          start_param?: string;
          can_send_after?: number;
          auth_date: number;
          hash: string;
        };
        ready(): void;
        expand(): void;
        close(): void;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        themeParams: {
          bg_color: string;
          text_color: string;
          hint_color: string;
          link_color: string;
          button_color: string;
          button_text_color: string;
        };
        colorScheme: 'light' | 'dark';
        isClosingConfirmationEnabled: boolean;
        BackButton: {
          isVisible: boolean;
          onClick(callback: () => void): void;
          offClick(callback: () => void): void;
          show(): void;
          hide(): void;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          onClick(callback: () => void): void;
          offClick(callback: () => void): void;
          show(): void;
          hide(): void;
          enable(): void;
          disable(): void;
          showProgress(leaveActive?: boolean): void;
          hideProgress(): void;
          setText(text: string): void;
          setParams(params: {
            color?: string;
            text_color?: string;
            is_visible?: boolean;
            is_active?: boolean;
            is_progress_visible?: boolean;
          }): void;
        };
        HapticFeedback: {
          impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
          notificationOccurred(type: 'error' | 'success' | 'warning'): void;
          selectionChanged(): void;
        };
        CloudStorage: {
          getItem(key: string): Promise<string | null>;
          setItem(key: string, value: string): Promise<void>;
          removeItem(key: string): Promise<void>;
          getKeys(): Promise<string[]>;
        };
        BiometricManager: {
          isInited: boolean;
          isSupported: boolean;
          isBiometricAvailable: boolean;
          isAccessRequested: boolean;
          isAccessGranted: boolean;
          init(): Promise<void>;
          requestAccess(): Promise<boolean>;
          authenticate(): Promise<boolean>;
        };
        Popup: {
          open(params: {
            title?: string;
            message: string;
            buttons?: Array<{
              id?: string;
              type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
              text: string;
            }>;
          }, callback?: (buttonId: string) => void): void;
          close(): void;
        };
        Alert: {
          show(message: string, callback?: () => void): void;
        };
        Confirm: {
          show(message: string, callback?: (confirmed: boolean) => void): void;
        };
        Prompt: {
          show(message: string, callback?: (value: string) => void): void;
        };
        ScanQrPopup: {
          open(params: {
            text?: string;
          }, callback?: (text: string) => void): void;
          close(): void;
        };
        SettingsButton: {
          isVisible: boolean;
          onClick(callback: () => void): void;
          offClick(callback: () => void): void;
          show(): void;
          hide(): void;
        };
        Invoice: {
          open(url: string, callback?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void): void;
        };
        showPopup(params: {
          title?: string;
          message: string;
          buttons?: Array<{
            id?: string;
            type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
            text: string;
          }>;
        }, callback?: (buttonId: string) => void): void;
        showAlert(message: string, callback?: () => void): void;
        showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
        showPrompt(message: string, callback?: (value: string) => void): void;
        showScanQrPopup(params: {
          text?: string;
        }, callback?: (text: string) => void): void;
        openInvoice(url: string, callback?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void): void;
        close(): void;
        expand(): void;
        ready(): void;
        isClosingConfirmationEnabled: boolean;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        themeParams: {
          bg_color: string;
          text_color: string;
          hint_color: string;
          link_color: string;
          button_color: string;
          button_text_color: string;
        };
        colorScheme: 'light' | 'dark';
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            is_bot: boolean;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
            added_to_attachment_menu?: boolean;
            allows_write_to_pm?: boolean;
            photo_url?: string;
          };
          chat?: {
            id: number;
            type: string;
            title?: string;
            username?: string;
            photo_url?: string;
          };
          chat_type?: string;
          chat_instance?: string;
          start_param?: string;
          can_send_after?: number;
          auth_date: number;
          hash: string;
        };
      };
    };
  }
}

export { };

