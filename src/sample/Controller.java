package sample;


import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.geometry.Insets;
import javafx.scene.Node;
import javafx.scene.control.*;
import javafx.scene.layout.VBox;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;
import javafx.stage.FileChooser;
import javafx.stage.Stage;


import java.io.*;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.ResourceBundle;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


// TODO:
// what if a invalid csv is parsed?

public class Controller implements Initializable {

    private List<Post> posts;
    private String[] answers;
    private int idx;

    @FXML private Stage stage;

    @FXML private WebView webView;

    @FXML private VBox dataContainer;

    @FXML private ProgressBar progressBar;

    @FXML private Label progressLabel;

    @FXML
    protected  void buttonPrevPressed() {

        // store the current answers
        answers[idx] = getAnswers();

        idx--;
        if(idx < 0) {
            idx = posts.size()-1;
        }

        setCheckBoxes();

        WebEngine webEngine = webView.getEngine();

        webEngine.load("https://stackoverflow.com/questions/"+ posts.get(idx));

        updateProgress();

    }

    @FXML
    protected  void buttonNextPressed() {

        // store the current answers
        answers[idx] = getAnswers();

        idx++;
        if(idx > posts.size() - 1) {
            idx = 0;
        }

        setCheckBoxes();

        WebEngine webEngine = webView.getEngine();

        webEngine.load("https://stackoverflow.com/questions/"+ posts.get(idx));

        updateProgress();

    }

    @Override
    public void initialize(URL location, ResourceBundle resources) {

        idx = 0;
        posts = new ArrayList<Post>();


        FileChooser fileChooser = new FileChooser();

        FileChooser.ExtensionFilter extFilter = new FileChooser.ExtensionFilter("CSV files (*.csv)", "*.csv");
        fileChooser.getExtensionFilters().add(extFilter);

        fileChooser.setTitle("Open CSV File");

        boolean success = false;

        do {

            File file = fileChooser.showOpenDialog(stage);
            if (file != null) {
                loadPostsFromCSV(file);
            }

            if(posts.equals(null) || posts.size() == 0) {
                Alert alert = new Alert(Alert.AlertType.CONFIRMATION);
                alert.setTitle("Error");
                alert.setHeaderText("No valid file chosen.");
                alert.setContentText("");

                ButtonType buttonTypeOne = new ButtonType("Retry");
                ButtonType buttonTypeTwo = new ButtonType("Exit");

                alert.getButtonTypes().setAll(buttonTypeOne, buttonTypeTwo);

                Optional<ButtonType> result = alert.showAndWait();
                if (result.get() == buttonTypeTwo) {
                    System.exit(1);
                }
            } else {
                success = true;
            }
        } while(!success);


        loadCategoriesFromCSV();

        answers = new String[posts.size()];

        progressLabel.setText("Post " + (idx+1) + "/" + posts.size());

        WebEngine webEngine = webView.getEngine();

        webEngine.loadContent("<html>"+posts.get(idx).getBody()+"</html>", "text/html");


    }

    private void loadCategoriesFromCSV() {
        ArrayList<Node> nodes = new ArrayList<Node>();

        BufferedReader br = null;

        try {

            String line;

            br = new BufferedReader(new FileReader("config.csv"));

            while ((line = br.readLine()) != null) {
                CheckBox cbx = new CheckBox();
                cbx.setText(line.split(";")[0]);

                cbx.paddingProperty().setValue(new Insets(15, 15, 15, 15));

                if(line.split(";").length > 1) {
                    Tooltip tp = new Tooltip(line.split(";")[1]);

                    tp.setPrefWidth(300);
                    tp.setWrapText(true);

                    Tooltip.install(cbx, tp);
                }

                dataContainer.getChildren().add(cbx);
            }

        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (br != null) {
                try {
                    br.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }


    }

    private void loadPostsFromCSV(File f) {

        BufferedReader br = null;

        try {

            String line;

            br = new BufferedReader(new FileReader(f.getAbsoluteFile()));

            while ((line = br.readLine()) != null) {
                //TODO what about 123a123?
                Pattern p = Pattern.compile("[0-9]+[;]*");
                Matcher m = p.matcher(line);
                if (m.find()) {
                    String[] data = line.split(";");
                    posts.add(new Post(Integer.parseInt(data[0]),data[1], data[2]));
                }
            }

        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (br != null) {
                try {
                    br.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    private void updateProgress() {
        // new answer?
//        if(null == answers[idx] ||answers[idx].equals("") || answers[idx].equals(null)) {
//            progressBar.setProgress(((float)answerCount/(float)posts.size()));
//        }

        progressLabel.setText("Post " + (idx+1) + "/" + posts.size());
    }

    private String getAnswers() {
        // get the answers
        String ans = "";

        ArrayList<Node> nodes = new ArrayList<Node>();
        for (Node node : dataContainer.getChildrenUnmodifiable()) {
            nodes.add(node);
            if (node instanceof CheckBox)
                ans += (((CheckBox) node).isSelected()) ? "x" : "-";
        }
        // save answers to disk
        Writer writer = null;

        try {
            writer = new BufferedWriter(new OutputStreamWriter(
                    new FileOutputStream("result.csv"), "utf-8"));

            for(int i = 0; i < answers.length; i++) {
                writer.write(posts.get(i) + ";" + answers[i] + "\r\n");
            }

        } catch (IOException ex) {
            // report
        } finally {
            try {writer.close();} catch (Exception ex) {/*ignore*/}
        }

        return ans;
    }

    private void setCheckBoxes() {

        int i = 0;
        ArrayList<Node> nodes = new ArrayList<Node>();
        for (Node node : dataContainer.getChildrenUnmodifiable()) {
            nodes.add(node);
            if (node instanceof CheckBox) {
                if (answers[idx] == null || answers[idx].charAt(i) != 'x') {
                    ((CheckBox) node).setSelected(false);
                } else {
                    ((CheckBox) node).setSelected(true);
                }
                i++;
            }
        }
    }

    public void setStage(Stage s) {
        this.stage = s;
    }
}
