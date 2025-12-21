package com.barberboss.app;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // CRÍTICO: Habilita debug do WebView para Chrome DevTools
        WebView.setWebContentsDebuggingEnabled(true);

        // Aguarda o bridge estar pronto antes de configurar
        registerPlugin(com.getcapacitor.plugin.WebView.class);
    }

    @Override
    public void onStart() {
        super.onStart();

        // Configurações adicionais do WebView após o bridge estar pronto
        if (this.bridge != null && this.bridge.getWebView() != null) {
            WebView webView = this.bridge.getWebView();

            // Configurações essenciais
            webView.getSettings().setJavaScriptEnabled(true);
            webView.getSettings().setDomStorageEnabled(true);
            webView.getSettings().setDatabaseEnabled(true);
            webView.getSettings().setAllowFileAccess(true);
            webView.getSettings().setAllowContentAccess(true);

            // Desabilita cache agressivo (útil para debug)
            webView.getSettings().setCacheMode(android.webkit.WebSettings.LOAD_DEFAULT);
        }
    }
}
