package sample;

/**
 * Created by mennel on 17.10.2017.
 */
public class Post {

    private int postID;
    private String title;
    private String body;

    public Post(int pID, String t, String b) {
        this.postID = pID;
        this.title = t;
        this.body = b;
    }

    public int getPostID() {
        return postID;
    }

    public String getTitle() {
        return title;
    }

    public String getBody() {
        return body;
    }
}
