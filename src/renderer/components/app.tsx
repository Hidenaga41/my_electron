import { ipcRenderer } from 'electron';
import React, { useState, useEffect, useCallback } from 'react';
import { Container, TextField } from '@material-ui/core';
import { FILE_EVENTS, saveFile, FileInfoType } from '../../fileIO';
import Menu from './menu';

const openFileDialog = (): void => {
  ipcRenderer.send(FILE_EVENTS.OPEN_DIALOG);
};

const openSaveAsDialog = (fileInfo: FileInfoType): void => {
  ipcRenderer.send(FILE_EVENTS.SAVE_DIALOG, fileInfo);
};

const App: React.FC = () => {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.currentTarget.value);
  }, []);

  const handleFileSave = useCallback(() => {
    if (fileName) {
      saveFile(fileName, text);
    } else {
      openSaveAsDialog({
        fileName: '',
        fileText: text,
      });
    }
  }, [fileName, text]);

  const handleFileSaveAs = useCallback(() => {
    openSaveAsDialog({
      fileName: fileName,
      fileText: text,
    });
  }, [fileName, text]);

  useEffect(() => {
    ipcRenderer.on(FILE_EVENTS.OPEN_FILE, (_, fileInfo: FileInfoType) => {
      setText(fileInfo.fileText);
      setFileName(fileInfo.fileName);
    });
    ipcRenderer.on(FILE_EVENTS.SAVE_FILE, (_, newFileName: string) => {
      setFileName(newFileName);
    });

    return (): void => {
      ipcRenderer.removeAllListeners(FILE_EVENTS.OPEN_FILE);
      ipcRenderer.removeAllListeners(FILE_EVENTS.SAVE_FILE);
    };
  });

  return (
    <Container>
      <Menu
        onFileOpen={openFileDialog}
        onFileSave={handleFileSave}
        onFileSaveAs={handleFileSaveAs}
      />
      <TextField
        multiline
        fullWidth
        variant="outlined"
        rows={10}
        rowsMax={20}
        value={text}
        inputProps={{
          style: {
            fontSize: 14,
          },
        }}
        onChange={handleChange}
        helperText={fileName || '[Untitled]'}
      />
    </Container>
  );
};

export default App;
