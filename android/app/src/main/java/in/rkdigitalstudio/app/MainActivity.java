package in.rkdigitalstudio.app;

import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.ConnectivityManager;
import android.net.NetworkCapabilities;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

public class MainActivity extends AppCompatActivity {

    private static final String DEFAULT_URL = "https://www.rkdigitaistudio.in/?source=android_app";
    private static final String STUDIO_HOST = "rkdigitaistudio.in";

    private WebView webView;
    private SwipeRefreshLayout swipeRefreshLayout;
    private ProgressBar progressBar;
    private View offlineLayout;
    private Button retryButton;

    private ValueCallback<Uri[]> filePathCallback;
    private ActivityResultLauncher<Intent> fileChooserLauncher;
    private long lastBackPressTime = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initViews();
        setupFileChooser();
        setupWebView();
        setupSwipeRefresh();
        setupBackNavigation();

        loadStudioWebsite();
    }

    private void initViews() {
        webView = findViewById(R.id.webView);
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout);
        progressBar = findViewById(R.id.progressBar);
        offlineLayout = findViewById(R.id.offlineLayout);
        retryButton = findViewById(R.id.retryButton);

        retryButton.setOnClickListener(v -> loadStudioWebsite());
    }

    private void setupFileChooser() {
        fileChooserLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (filePathCallback != null) {
                        Uri[] results = null;
                        if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                            if (result.getData().getClipData() != null) {
                                int count = result.getData().getClipData().getItemCount();
                                results = new Uri[count];
                                for (int i = 0; i < count; i++) {
                                    results[i] = result.getData().getClipData().getItemAt(i).getUri();
                                }
                            } else if (result.getData().getData() != null) {
                                results = new Uri[]{result.getData().getData()};
                            }
                        }
                        filePathCallback.onReceiveValue(results);
                        filePathCallback = null;
                    }
                }
        );
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void setupWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        settings.setCacheMode(isNetworkConnected() ? WebSettings.LOAD_DEFAULT : WebSettings.LOAD_CACHE_ELSE_NETWORK);

        // Custom User Agent identifier
        String defaultUa = settings.getUserAgentString();
        settings.setUserAgentString(defaultUa + " RKDigitalStudioApp/1.0.0");

        webView.setWebViewClient(new StudioWebViewClient());
        webView.setWebChromeClient(new StudioWebChromeClient());
    }

    private void setupSwipeRefresh() {
        swipeRefreshLayout.setColorSchemeResources(
                R.color.accent,
                R.color.primary
        );
        swipeRefreshLayout.setProgressBackgroundColorSchemeResource(R.color.card_dark);

        swipeRefreshLayout.setOnRefreshListener(() -> {
            if (isNetworkConnected()) {
                webView.reload();
            } else {
                swipeRefreshLayout.setRefreshing(false);
                Toast.makeText(this, R.string.offline_title, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void setupBackNavigation() {
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView != null && webView.canGoBack()) {
                    webView.goBack();
                } else {
                    if (System.currentTimeMillis() - lastBackPressTime < 2000) {
                        finish();
                    } else {
                        lastBackPressTime = System.currentTimeMillis();
                        Toast.makeText(MainActivity.this, "Press back again to exit RK DIGITAL STUDIO", Toast.LENGTH_SHORT).show();
                    }
                }
            }
        });
    }

    private void loadStudioWebsite() {
        if (isNetworkConnected()) {
            offlineLayout.setVisibility(View.GONE);
            webView.setVisibility(View.VISIBLE);
            webView.loadUrl(DEFAULT_URL);
        } else {
            showOfflineView();
        }
    }

    private void showOfflineView() {
        webView.setVisibility(View.GONE);
        offlineLayout.setVisibility(View.VISIBLE);
        swipeRefreshLayout.setRefreshing(false);
        progressBar.setVisibility(View.GONE);
    }

    private boolean isNetworkConnected() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        if (cm == null) return false;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            android.net.Network network = cm.getActiveNetwork();
            if (network == null) return false;
            NetworkCapabilities capabilities = cm.getNetworkCapabilities(network);
            return capabilities != null && (
                    capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ||
                    capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) ||
                    capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)
            );
        } else {
            @SuppressWarnings("deprecation")
            android.net.NetworkInfo networkInfo = cm.getActiveNetworkInfo();
            return networkInfo != null && networkInfo.isConnected();
        }
    }

    // --- WebView Client ---
    private class StudioWebViewClient extends WebViewClient {

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            String url = request.getUrl().toString();
            return handleUrlOverride(url);
        }

        @SuppressWarnings("deprecation")
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            return handleUrlOverride(url);
        }

        private boolean handleUrlOverride(String url) {
            if (url == null) return false;

            // Direct WhatsApp Click-to-Chat Handler
            if (url.startsWith("whatsapp://") || url.contains("wa.me") || url.contains("api.whatsapp.com")) {
                try {
                    Intent waIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(waIntent);
                    return true;
                } catch (ActivityNotFoundException e) {
                    Toast.makeText(MainActivity.this, "WhatsApp is not installed on this device.", Toast.LENGTH_SHORT).show();
                    return true;
                }
            }

            // Direct Phone Call Handler
            if (url.startsWith("tel:")) {
                try {
                    Intent telIntent = new Intent(Intent.ACTION_DIAL, Uri.parse(url));
                    startActivity(telIntent);
                    return true;
                } catch (Exception e) {
                    return false;
                }
            }

            // Direct Email Handler
            if (url.startsWith("mailto:")) {
                try {
                    Intent mailIntent = new Intent(Intent.ACTION_SENDTO, Uri.parse(url));
                    startActivity(mailIntent);
                    return true;
                } catch (Exception e) {
                    return false;
                }
            }

            // Google Maps Navigation
            if (url.startsWith("geo:") || url.contains("maps.google.com") || url.contains("share.google")) {
                try {
                    Intent mapIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(mapIntent);
                    return true;
                } catch (Exception e) {
                    return false;
                }
            }

            // Internal studio website navigation
            if (url.contains(STUDIO_HOST) || url.startsWith("/")) {
                return false;
            }

            // External website link
            try {
                Intent extIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                startActivity(extIntent);
                return true;
            } catch (Exception e) {
                return false;
            }
        }

        @Override
        public void onPageStarted(WebView view, String url, Bitmap favicon) {
            super.onPageStarted(view, url, favicon);
            progressBar.setVisibility(View.VISIBLE);
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            progressBar.setVisibility(View.GONE);
            swipeRefreshLayout.setRefreshing(false);
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            super.onReceivedError(view, request, error);
            if (request.isForMainFrame() && !isNetworkConnected()) {
                showOfflineView();
            }
        }
    }

    // --- WebChrome Client ---
    private class StudioWebChromeClient extends WebChromeClient {

        @Override
        public void onProgressChanged(WebView view, int newProgress) {
            progressBar.setProgress(newProgress);
            if (newProgress >= 100) {
                progressBar.setVisibility(View.GONE);
                swipeRefreshLayout.setRefreshing(false);
            } else {
                progressBar.setVisibility(View.VISIBLE);
            }
        }

        @Override
        public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
            if (MainActivity.this.filePathCallback != null) {
                MainActivity.this.filePathCallback.onReceiveValue(null);
            }
            MainActivity.this.filePathCallback = filePathCallback;

            Intent intent = fileChooserParams.createIntent();
            try {
                fileChooserLauncher.launch(intent);
            } catch (ActivityNotFoundException e) {
                MainActivity.this.filePathCallback = null;
                Toast.makeText(MainActivity.this, "Cannot open file picker", Toast.LENGTH_SHORT).show();
                return false;
            }
            return true;
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) webView.onResume();
    }

    @Override
    protected void onPause() {
        if (webView != null) webView.onPause();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
