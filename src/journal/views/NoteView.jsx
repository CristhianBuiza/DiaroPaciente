import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  DeleteOutline,
  SaveOutlined,
  UploadOutlined,
} from "@mui/icons-material";
import {
  Button,
  Grid,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.css";
import { useForm } from "../../hooks/useForm";
import { ImageGallery } from "../components";
import {
  setActiveNote,
  startDeletingNote,
  startSaveNote,
  startUploadingFiles,
} from "../../store/journal";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";

const medicalAreas = [
  "Medicina General",
  "Cardiología",
  "Dermatología",
  "Gastroenterología",
  "Neurología",
  // Agrega más áreas médicas aquí según tus necesidades
];

const NoteReport = ({ note }) => {
  const dateString = useMemo(() => {
    const newDate = new Date(note.date);
    const day = newDate.toLocaleDateString("es-ES", { day: "2-digit" });
    const month = newDate.toLocaleDateString("es-ES", { month: "long" });
    const year = newDate.toLocaleDateString("es-ES", { year: "numeric" });
    const hour = newDate.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${day} de ${month} de ${year} - ${hour}`;
  }, [note.date]);

  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.container}>
          <Text style={styles.title}>Asunto: {note.title}</Text>
          <Text style={styles.date}>Fecha: {dateString}</Text>
          <Text style={styles.dni}>DNI: {note.dni}</Text>
          <Text style={styles.area}>Área: {note.area}</Text>
          <Text style={styles.body}>Detalles: {note.body}</Text>
        </View>
      </Page>
    </Document>
  );
};

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 20,
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  date: {
    fontSize: 16,
    marginBottom: 10,
  },
  dni: {
    fontSize: 16,
    marginBottom: 10,
  },
  area: {
    fontSize: 16,
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
  },
});

export const NoteView = () => {
  const dispatch = useDispatch();
  const {
    active: note,
    messageSaved,
    isSaving,
  } = useSelector((state) => state.journal);

  const { body, title, date, area, dni, onInputChange, formState } =
    useForm(note);

  const [showReport, setShowReport] = useState(false);

  const fileInputRef = useRef();

  useEffect(() => {
    dispatch(setActiveNote(formState));
  }, [formState]);

  useEffect(() => {
    if (messageSaved.length > 0) {
      Swal.fire("Nota actualizada", messageSaved, "success");
    }
  }, [messageSaved]);

  const onSaveNote = () => {
    dispatch(startSaveNote());
  };

  const onFileInputChange = ({ target }) => {
    if (target.files === 0) return;
    dispatch(startUploadingFiles(target.files));
  };

  const onDelete = () => {
    dispatch(startDeletingNote());
  };

  const downloadReport = () => {
    setShowReport(!showReport);
  };

  return (
    <Grid
      container
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ mb: 1 }}
      className="animate__animated animate__fadeIn animate__faster"
    >
      <Grid item>
        <Typography fontSize={39} fontWeight="light">
          {new Date(date).toLocaleString("es-ES", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Typography>
      </Grid>
      <Grid item>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={onFileInputChange}
          style={{ display: "none" }}
        />

        <IconButton
          color="primary"
          disabled={isSaving}
          onClick={() => fileInputRef.current.click()}
        >
          <UploadOutlined />
        </IconButton>

        <Button
          disabled={isSaving}
          onClick={onSaveNote}
          color="primary"
          sx={{ padding: 2 }}
        >
          <SaveOutlined sx={{ fontSize: 30, mr: 1 }} />
          Guardar
        </Button>
      </Grid>

      <Grid container>
        <TextField
          type="text"
          variant="filled"
          fullWidth
          placeholder="Ingrese un título"
          label="Título"
          sx={{ border: "none", mb: 1 }}
          name="title"
          value={title}
          onChange={onInputChange}
        />

        <TextField
          select
          variant="filled"
          fullWidth
          label="Área Médica"
          name="area"
          value={area}
          onChange={onInputChange}
        >
          {medicalAreas.map((area) => (
            <MenuItem key={area} value={area}>
              {area}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          type="text"
          variant="filled"
          fullWidth
          placeholder="DNI"
          label="DNI"
          sx={{ border: "none", mb: 1 }}
          name="dni"
          value={dni}
          onChange={onInputChange}
        />

        <TextField
          type="text"
          variant="filled"
          fullWidth
          multiline
          placeholder="¿Qué sucedió en el día de hoy?"
          minRows={5}
          name="body"
          value={body}
          onChange={onInputChange}
        />
      </Grid>

      <Grid container justifyContent="end">
        <Button onClick={onDelete} sx={{ mt: 2 }} color="error">
          <DeleteOutline />
          Borrar
        </Button>
      </Grid>

      <Button onClick={downloadReport} sx={{ ml: 1 }}>
        Descargar Reporte
      </Button>

      {showReport && (
        <PDFViewer style={{ width: "100%", height: "600px" }}>
          <NoteReport note={note} />
        </PDFViewer>
      )}
      <ImageGallery images={note.imageUrls} />

      {/* Image gallery */}
    </Grid>
  );
};
