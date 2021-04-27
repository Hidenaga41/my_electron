import React from 'react';
import { Button, ButtonGroup, makeStyles, Theme } from '@material-ui/core';
import { Save, FolderOpen, NoteAdd } from '@material-ui/icons';

const useStyles = makeStyles((theme: Theme) => ({
  buttonWrp: {
    margin: theme.spacing(2, 0, 3),
  },
  buttonIcon: {
    marginLeft: theme.spacing(0.5),
  },
}));

interface MenuProps {
  onFileOpen: () => void;
  onFileSave: () => void;
  onFileSaveAs: () => void;
}

const Menu: React.FC<MenuProps> = (props) => { 
  const classes = useStyles();

  return (
    <ButtonGroup
      variant="outlined"
      
      color="primary"
      className={classes.buttonWrp}
    >
      <Button onClick={props.onFileOpen}>
        OPEN
        <FolderOpen className={classes.buttonIcon} />
      </Button>
      <Button onClick={props.onFileSave}>
        SAVE
        <Save className={classes.buttonIcon} />
      </Button>
      <Button onClick={props.onFileSaveAs}>
        SAVE AS
        <NoteAdd className={classes.buttonIcon} />
      </Button>
    </ButtonGroup>
  );
};

export default Menu;
