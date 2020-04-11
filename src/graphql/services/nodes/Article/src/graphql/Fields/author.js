const gql = require("graphql-tag");

async function author(root, args, { injections: { execute } }) {
    const { data, errors } = await execute(
        gql`
            query($id: ID!) {
                userById(id: $id) {
                    id
                    image
                    username
                    bio
                    email
                    followedByViewer
                }
            }
        `,
        {
            variables: {
                id: root.author.id || root.author
            }
        }
    );

    if (errors && errors.length) {
        throw new Error(errors[0].message);
    }

    return data.userById;
}

module.exports = author;
