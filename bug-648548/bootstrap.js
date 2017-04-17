const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/devtools/Console.jsm");
Cu.import("resource://gre/modules/ctypes.jsm");

const kAddonID = "bug-648548@mozilla.org";
const kFontList = [/* ... */];
const kRuntime = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime);

function windowsBroadCastFontChange()
{
    // These are taken from MinGW-w64
    const HWND_BROADCAST = ctypes.voidptr_t(0xFFFF);
    const WM_FONTCHANGE = 0x001D;
    let libUser32 = ctypes.open("User32.dll");
    let SendMessage =
        libUser32.declare("SendMessageA",
                          ctypes.winapi_abi,
                          ctypes.long, // LRESULT
                          ctypes.voidptr_t, // HWND
                          ctypes.unsigned_int, // UINT
                          ctypes.int, // WPARAM
                          ctypes.long // LPARAM
                         );
    SendMessage(HWND_BROADCAST, WM_FONTCHANGE, 0, 0);
    libUser32.close();
}

function windowsRegisterFont(aFontPath)
{
    // Add the font resource and broadcast the change.
    let libGdi32 = ctypes.open("Gdi32.dll");
    let AddFontResource =
        libGdi32.declare("AddFontResourceA",
                         ctypes.winapi_abi,
                         ctypes.int, // int
                         ctypes.char.ptr // LPCTSTR lpszFilename
                        );
    if (AddFontResource(aFontPath) == 0) {
        console.error("Failed to add font resource " + aFontPath);
    }
    libGdi32.close();
}

function windowsUnregisterFont(aFontPath)
{
    let libGdi32 = ctypes.open("Gdi32.dll");
    let RemoveFontResource =
        libGdi32.declare("RemoveFontResourceA",
                         ctypes.winapi_abi,
                         ctypes.int, // BOOL
                         ctypes.char.ptr // LPCTSTR lpFileName
                        );
    if (RemoveFontResource(aFontPath) == 0) {
        console.error("Failed to remove font resource " + aFontPath);
    }
    libGdi32.close();
}

function getFontsDir()
{
    // Ensure there is a fonts/ directory in the profile directory.
    let fontsDir = Cc["@mozilla.org/toolkit/profile-service;1"].
        createInstance(Ci.nsIToolkitProfileService).
        selectedProfile.localDir.clone();
    fontsDir.appendRelativePath("fonts");
    if (!fontsDir.exists()) {
      fontsDir.create(Ci.nsIFile.DIRECTORY_TYPE, 0x1ff);
    } else {
      fontsDir.permissions = 0x1ff;
    }
    return fontsDir;
}

function updateFontList()
{
    if (kRuntime.OS == "WINNT") {
        windowsBroadCastFontChange();
    }
    let fonts = Cc["@mozilla.org/gfx/fontenumerator;1"].
        getService(Components.interfaces.nsIFontEnumerator);
    fonts.updateFontList();
}

function startup(aData, aReason)
{
    let fontsDir = getFontsDir();

    for (var i = 0; i < kFontList.length; i++) {
        // Get the path of the file copied to the profile directory.
        let profileFontFile = fontsDir.clone();
        profileFontFile.append(kFontList[i]);

        if (aReason == APP_STARTUP) {
            if (kRuntime.OS == "WINNT" && profileFontFile.exists()) {
                windowsRegisterFont(profileFontFile.path);
            }
            continue;
        }

        // Copy the file from the addon directory to profile directory.
        if (!profileFontFile.exists()) {
            let addonFontFile = Cc["@mozilla.org/file/directory_service;1"].
                getService(Ci.nsIProperties).
                get("ProfD", Ci.nsIFile);
            addonFontFile.appendRelativePath("extensions");
            addonFontFile.appendRelativePath(kAddonID);
            addonFontFile.append(kFontList[i]);
            addonFontFile.copyTo(fontsDir, kFontList[i]);
            if (kRuntime.OS == "WINNT") {
                windowsRegisterFont(profileFontFile.path);
            }
        }
    }

    updateFontList();
}

function shutdown(aData, aReason)
{
    let fontsDir = getFontsDir();

    for (var i = 0; i < kFontList.length; i++) {

        let profileFontFile = fontsDir.clone();
        profileFontFile.append(kFontList[i]);
        if (kRuntime.OS == "WINNT" && profileFontFile.exists()) {
            windowsUnregisterFont(profileFontFile.path);
        }

        if (aReason == APP_SHUTDOWN) {
            continue;
        }

        // Remove the file from the profile directory.
        if (profileFontFile.exists()) {
            profileFontFile.remove(true);
        }
    }

    updateFontList();
}

function install() {}
function uninstall() {}
