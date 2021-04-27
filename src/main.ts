import os from 'os';
import path from 'path';
import { BrowserWindow, app, dialog, ipcMain } from 'electron';
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
app.on('ready', () => {
  createWindow();

  if (isEnv && mainWindow) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    // BrowserWindow.addDevToolsExtension(
    //   path.join(
    //     os.homedir(),
    //     '/AppData/Local/Google/Chrome/User Data/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.2.0_0',
    //   ),
    // );
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
