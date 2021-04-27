import os from 'os';
import fs from 'fs';
import path from 'path';
import { BrowserWindow, app, dialog, ipcMain, session } from 'electron';
import {
  FILE_EVENTS,
  readFile,
  saveFile,
  FileInfoType,
  FILE_FILTERS,
} from './fileIO';

const isEnv: boolean = process.env.NODE_ENV === 'development';

const mainURL = `file://${__dirname}/index.html`;
let mainWindow: BrowserWindow | null = null;

/**
 * React Devtools の場所を探す関数
 */
const searchReactDevtools = async () => {
  const isWin32 = os.platform() === 'win32';
  const isDarwin = os.platform() === 'darwin';

  const reactDevtools = '/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi';

  const extDir = isDarwin
    ? // macOS
      '/Library/Application Support/Google/Chrome'
    : isWin32
    ? // Windows
      '/AppData/Local/Google/Chrome/User Data'
    : // Linux
      '/.config/google-chrome';

  // React Devtools フォルダの絶対パス
  const dirPath = path.join(os.homedir(), extDir, reactDevtools);

  return await fs.promises
    .readdir(dirPath, { withFileTypes: true })
    .then((dirents) =>
      dirents
        .filter((dirent) => dirent.isDirectory())
        .map(({ name }) => path.resolve(dirPath, name))
        .shift(),
    )
    .catch((err) => console.log(`Error: ${err}`));
};

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 450,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(mainURL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// アプリの起動と終了
app.on('ready', async () => {

  // 開発環境の場合はReact Dev Toolsを表示
  if (isEnv) {
    const extPath = await searchReactDevtools();
    if (extPath) {
      await session.defaultSession
        .loadExtension(extPath, { allowFileAccess: true })
        .then(() => console.log('React Devtools loaded...'))
        .catch((err) => console.log(`ERROR: ${err}`));
    }
  }
  createWindow();

  if (isEnv && mainWindow) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
});

app.on('window-all-closed', () => {
  app.quit();
});
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// ファイルを開く
ipcMain.on(FILE_EVENTS.OPEN_DIALOG, () => {
  if (mainWindow === null) return;
  const fileNames: string[] | undefined = dialog.showOpenDialogSync(
    mainWindow,
    {
      properties: ['openFile'],
      filters: FILE_FILTERS,
    },
  );
  if (!fileNames || !fileNames.length) return;
  const fileText = readFile(fileNames[0]);
  mainWindow.webContents.send(FILE_EVENTS.OPEN_FILE, {
    fileName: fileNames[0],
    fileText,
  });
});

// 名前をつけて保存する
ipcMain.on(FILE_EVENTS.SAVE_DIALOG, (_, fileInfo: FileInfoType) => {
  if (mainWindow === null) return;
  const newFileName: string | undefined = dialog.showSaveDialogSync(
    mainWindow,
    {
      defaultPath: fileInfo.fileName,
      filters: FILE_FILTERS,
    },
  );
  if (!newFileName) return;
  saveFile(newFileName, fileInfo.fileText);
  mainWindow.webContents.send(FILE_EVENTS.SAVE_FILE, newFileName);
});
