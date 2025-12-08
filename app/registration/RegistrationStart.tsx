import { Conference } from "@/app/types/conference";
import Button from "@mui/material/Button";

import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";

const Registration = ({ conference }: { conference: Conference }) => <Card>

        <CardMedia component="img" image={`http://localhost:1337${conference.logo?.formats.small?.url}`} alt={conference.longName} />
        <CardHeader title={conference.longName} titleTypographyProps={{ fontSize: "120%" }}/> 
        <CardContent>
            Conference found! Click below to start your registration.
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end' }}>
            <Button size="small" href={`/registration?conferenceId=${conference.documentId}`} variant="contained">Get Started</Button>
        </CardActions>
    </Card>
   

export default Registration;