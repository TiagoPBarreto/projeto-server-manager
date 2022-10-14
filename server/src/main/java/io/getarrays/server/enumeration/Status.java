package io.getarrays.server.enumeration;

public enum Status {
    SERVER_UP("SERVER_UP"),
    SERVER_DOW("SERVER_DOW");

    private final String status;

    Status(String status){
        this.status = status;
    }

    public String getStatus(){
        return this.status;
    }
}
