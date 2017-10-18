package sample;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.scene.layout.GridPane;
import javafx.stage.Stage;

public class Main extends Application {

    @Override
    public void start(Stage primaryStage) throws Exception{
        FXMLLoader loader = new FXMLLoader(getClass().getResource("sample.fxml"));
        Parent root = loader.load();

        primaryStage.setTitle("StackOverflow Categorization Tool");
        primaryStage.setScene(new Scene(root, 800, 600));

        primaryStage.setMinWidth(800);
        primaryStage.setMinHeight(600);


        primaryStage.getIcons().add(new Image("file:icon.png"));

        primaryStage.show();


        Controller c = loader.getController();
        c.setStage(primaryStage);
    }


    public static void main(String[] args) {
        launch(args);
    }
}
