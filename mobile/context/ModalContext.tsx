import React, { createContext, useContext, useState, ReactNode } from "react";
import { Portal, Modal, Button, Text } from "react-native-paper";
import { View, StyleSheet } from "react-native";

type ModalContextType = {
  showConfirm: (options: ConfirmOptions) => void;
};

type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  destructive?: boolean;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  const showConfirm = (opts: ConfirmOptions) => {
    setOptions(opts);
    setVisible(true);
  };

  const handleConfirm = () => {
    options?.onConfirm();
    setVisible(false);
    setOptions(null);
  };

  const handleCancel = () => {
    options?.onCancel?.();
    setVisible(false);
    setOptions(null);
  };

  return (
    <ModalContext.Provider value={{ showConfirm }}>
      {children}
      <Portal>
        <Modal
          visible={visible}
          onDismiss={handleCancel}
          contentContainerStyle={styles.modal}
        >
          {options && (
            <>
              <Text variant='titleLarge' style={styles.title}>
                {options.title}
              </Text>
              <Text variant='bodyMedium' style={styles.message}>
                {options.message}
              </Text>
              <View style={styles.actions}>
                <Button onPress={handleCancel}>
                  {options.cancelText || "Cancelar"}
                </Button>
                <Button
                  mode='contained'
                  onPress={handleConfirm}
                  buttonColor={options.destructive ? "#DC2626" : undefined}
                >
                  {options.confirmText || "Confirmar"}
                </Button>
              </View>
            </>
          )}
        </Modal>
      </Portal>
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within ModalProvider");
  }
  return context;
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: "white",
    padding: 24,
    margin: 20,
    borderRadius: 12,
    maxWidth: 500,
    alignSelf: "center",
    width: "100%",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 12,
  },
  message: {
    marginBottom: 24,
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
});
